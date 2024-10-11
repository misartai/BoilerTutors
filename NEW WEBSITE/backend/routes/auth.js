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
      return res.status(400).send('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send('Invalid email or password');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Failed to log in');
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
          console.log('Admin notified about pending professor account. You will recieve an email when your account is approved.');
        } catch (err) {
          console.error('Error sending email to admin:', err);
        }
      }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Remove from temp storage
    delete tempUsers[email];

    res.status(200).json({ token });
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
