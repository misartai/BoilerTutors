const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();
const adminEmail = 'aryanshahu13@gmail.com';
let tempUsers = {};  // Temporary storage for users who haven't confirmed email

// Setup Nodemailer transporter (adjust with your email provider settings)
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use other services (e.g., Outlook, Yahoo)
  auth: {
    user: 'boilertutors420',
    pass: 'zins bweo neuh zzgz'
  }
});

// Function to generate a random 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000);

// Signup route (store temporarily and send confirmation email)
router.post('/signup', async (req, res) => {
  const { name, email, password, accountType, isTutor } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already registered');
    }

    // Generate a confirmation code
    const confirmationCode = generateCode();

    // Store user temporarily
    tempUsers[email] = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      accountType,
      isTutor,
      confirmationCode
    };

    // Send confirmation email
    const mailOptions = {
      from: 'boilertutors420',
      to: email,
      subject: 'Email Verification Code',
      text: `Your confirmation code is: ${confirmationCode}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send('Confirmation email sent');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Failed to create user');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid email, no user of this email exists.');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send('Incorrect Password');
    }

    if (user.validAccount === false) {
      return res.status(403).send('Account Pending');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Failed to log in');
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Email not found');
    }

    // Generate and send a confirmation code
    const resetCode = Math.floor(100000 + Math.random() * 900000);  // Generate 6-digit code
    tempUsers[email] = { resetCode };  // Store the code temporarily

    const mailOptions = {
      from: 'boilertutors420@gmail.com',
      to: email,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${resetCode}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send('Reset code sent');
  } catch (err) {
    console.error('Error sending reset code:', err);
    res.status(500).send('Error sending reset code');
  }
});

router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  const tempUser = tempUsers[email];
  if (!tempUser || tempUser.resetCode != code) {
    return res.status(400).send('Invalid reset code');
  }

  res.status(200).send('Code verified');
});

router.post('/resend-reset-code', async (req, res) => {
  const { email } = req.body;

  const tempUser = tempUsers[email];
  if (!tempUser) {
    return res.status(400).send('Invalid email');
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000);  // Generate new code
  tempUser.resetCode = resetCode;  // Update the code

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Resend: Password Reset Code',
    text: `Your new password reset code is: ${resetCode}`
  };

  await transporter.sendMail(mailOptions);
  res.status(200).send('Reset code resent');
});

router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Email not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Generate a new JWT token after password reset
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token , validAccount: user.validAccount });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).send('Error resetting password');
  }
});


// Route to verify the code
router.post('/verify-email', async (req, res) => {
  const { email, confirmationCode } = req.body;

  const tempUser = tempUsers[email];
  if (!tempUser) {
    return res.status(400).send('Invalid email');
  }

  if (tempUser.confirmationCode == confirmationCode) {
    // Save the user to the database
    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      accountType: tempUser.accountType,
      isTutor: tempUser.isTutor,
      validAccount: (tempUser.accountType == 'professor') ? false : true
    });
    await newUser.save();

    if (tempUser.accountType == 'professor') {
        const mailOptions = {
          from: 'boilertutors420@gmail.com',
          to: adminEmail,
          subject: 'Professor Account Pending Approval',
          text: `A new professor account for ${tempUser.name} (${tempUser.email}) is pending approval. Please verify the account.`
        };
  
        try {
          await transporter.sendMail(mailOptions);
          console.log('Admin notified about pending professor account.');
        } catch (err) {
          console.error('Error sending email to admin:', err);
        }
      }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Remove from temp storage
    delete tempUsers[email];

    res.status(200).json({ token, validAccount: newUser.validAccount });
  } else {
    res.status(400).send('Invalid confirmation code');
  }
});

// Route to resend the email
router.post('/resend-email', async (req, res) => {
  const { email } = req.body;
  const tempUser = tempUsers[email];
  if (!tempUser) {
    return res.status(400).send('Invalid email');
  }

  const confirmationCode = generateCode();
  tempUser.confirmationCode = confirmationCode;

  // Send the email again
  const mailOptions = {
    from: 'boilertutors420@gmail.com',
    to: email,
    subject: 'Resend: Email Verification Code',
    text: `Your new confirmation code is: ${confirmationCode}`
  };

  await transporter.sendMail(mailOptions);
  res.status(200).send('Confirmation email resent');
});


router.put('/update-profile', async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  try {
    // Decode the token to get userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Now you can use userId in this route
    const { name, email, password } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    res.status(200).send('Profile updated successfully');
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Failed to update profile');
  }
});


router.delete('/delete-account', async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).send('User not found');
    }

    res.status(200).send('Account deleted successfully');
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).send('Failed to delete account');
  }
});

router.put('/update-courses', async (req, res) => {
  const { courses } = req.body;

  try {
    // Extract the userId from the JWT token
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the user by userId and update the courses field
    const user = await User.findByIdAndUpdate(userId, { courses }, { new: true });
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).send('Courses updated successfully');
  } catch (err) {
    console.error('Error updating courses:', err);
    res.status(500).send('Failed to update courses');
  }
});

// Route to get logged-in user data
router.get('/me', async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).send('Failed to fetch user data');
  }
});

module.exports = router;
