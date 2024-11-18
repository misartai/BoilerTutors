const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Message = require('../models/Message');
const Draft = require('../models/Draft');
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

router.put('/update-tutor-status', async (req, res) => {
  const { isTutor } = req.body;

  try {
    // Retrieve the userId from the token
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find and update the user's tutor status
    const user = await User.findByIdAndUpdate(userId, { isTutor }, { new: true });
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).send('Tutor status updated successfully');
  } catch (err) {
    console.error('Error updating tutor status:', err);
    res.status(500).send('Failed to update tutor status');
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

// Middleware to authenticate the user via JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach user data to req for later use
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

// Function to send notification email
const sendNotificationEmail = async (recipientEmail, messageContent, senderEmail) => {
  const mailOptions = {
    from: 'boilertutors420@gmail.com', // sender address
    to: recipientEmail, // list of receivers
    subject: 'New Message Notification', // Subject line
    text: `You have received a new message from ${senderEmail}:\n\n${messageContent}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

// Function to send notification email
const sendAnnouncementEmail = async (recipientEmail, messageContent, senderEmail) => {
  const mailOptions = {
    from: 'boilertutors420@gmail.com', // sender address
    to: recipientEmail, // list of receivers
    subject: 'New Announcement Notification', // Subject line
    text: `You have received a new Announcement from ${senderEmail}:\n\n${messageContent}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

module.exports = { sendNotificationEmail, sendAnnouncementEmail };

// Route to retrieve conversation history
router.get('/history/:userId', authenticate, async (req, res) => {
  const { userId: otherUserId } = req.params;

  try {
    const userId = req.user.userId;

    // Fetch messages between the authenticated user and the other user
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Retrieve history error:', err);
    res.status(500).send('Failed to retrieve conversation history');
  }
});

// Route to mark messages as read
router.post('/mark-read', authenticate, async (req, res) => {
  const { messageIds } = req.body;

  try {
    await Message.updateMany(
      { _id: { $in: messageIds }, receiverId: req.user.userId },
      { $set: { isRead: true } }
    );

    res.status(200).send('Messages marked as read');
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).send('Failed to mark messages as read');
  }
});

// Route to retrieve announcements (if stored as messages with isAnnouncement flag)
router.get('/announcements', authenticate, async (req, res) => {
  try {
    const announcements = await Message.find({ isAnnouncement: true }).sort({ timestamp: -1 });
    res.status(200).json(announcements);
  } catch (err) {
    console.error('Retrieve announcements error:', err);
    res.status(500).send('Failed to retrieve announcements');
  }
});

// Endpoint to get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}); // Fetch all users
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Fetch all announcements
router.get('/api/announcements', async (req, res) => {
    try {
        const announcements = await Message.find({ isAnnouncement: true });
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).send('Server Error');
    }
});

// Route to save a draft
router.post('/save-draft', async (req, res) => {
  const { senderEmail, recipientEmail, content } = req.body;

  const draft = new Draft({
    senderEmail,
    recipientEmail,
    content,
  });

  try {
    const savedDraft = await draft.save();
    res.status(201).json(savedDraft);
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: 'Error saving draft' });
  }
});

// Route to get drafts
router.get('/:userEmail', async (req, res) => {
  try {
    const drafts = await Draft.find({ senderEmail: req.params.userEmail });
    res.status(200).json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ message: 'Error fetching drafts' });
  }
});

//send message
//send message
router.post('/send-message', async (req, res) => {
  const { senderEmail, recipientEmail, content } = req.body;

  try {
    // Fetch user IDs based on emails
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: recipientEmail });

    if (!sender || !receiver) {
      return res.status(404).send('Sender or recipient not found');
    }

    const newMessage = new Message({
      senderId: sender._id,
      receiverId: receiver._id,
      content,
      createdAt: new Date(), // Store timestamp
      isAnnouncement: false,
      isRead: false,
    });

    // Save the message to MongoDB
    const savedMessage = await newMessage.save();
    console.log('Message saved:', savedMessage);

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Failed to save message' });
  }
});

router.get('/history/:userId', authenticate, async (req, res) => {
  const { userId: otherUserId } = req.params;

  try {
    const userId = req.user.userId;

    // Fetch messages between the authenticated user and the other user
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
    .sort({ createdAt: 1 }) // Sort by timestamp
    .select('senderId receiverId content createdAt isRead');

    // Format timestamp
    const formattedMessages = messages.map((msg) => ({
      ...msg._doc,
      createdAt: msg.createdAt.toLocaleString(), // Formats the timestamp
    }));

    res.status(200).json(formattedMessages);
  } catch (err) {
    console.error('Retrieve history error:', err);
    res.status(500).send('Failed to retrieve conversation history');
  }
});


module.exports = router;
