const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message');
const Annoucement = require('..')

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

// Route to send a message
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Route to send a message
router.post('/api/messages', async (req, res) => {
  const { senderEmail, receiverEmail, content } = req.body;

  try {
    // Create a new message
    const message = new Message({
      senderEmail,
      receiverEmail,
      content
    });

    // Save to MongoDB
    const savedMessage = await message.save();

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).send('Failed to save message');
  }
});

// Route to retrieve conversation history
router.get('/history/:userId', async (req, res) => {
  const { userId: otherUserId } = req.params;

  try {
    const userId = req.user.userId;  // Assuming userId is available in the request object after authentication

    // Fetch messages between the authenticated user and the other user
    const messages = await Message.find({
      $or: [
        { senderEmail: userId, receiverEmail: otherUserId },
        { senderEmail: otherUserId, receiverEmail: userId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Retrieve history error:', err);
    res.status(500).send('Failed to retrieve conversation history');
  }
});

// Route to mark messages as read
router.put('/api/messages/:id/read', async (req, res) => {
  const messageId = req.params.id;

  try {
    // Find the message by ID
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only update readStamp and isRead if the message is not already marked as read
    if (!message.isRead) {
      message.isRead = true;
      message.readStamp = new Date(); // Set the read timestamp only once
      await message.save();
    }

    return res.status(200).json({ message: 'Message marked as read', message });
  } catch (error) {
    console.error('Error updating read status:', error);
    return res.status(500).json({ error: 'An error occurred while updating message' });
  }
});

// Route to retrieve announcements (if stored as messages with isAnnouncement flag)
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Message.find({
      isAnnouncement: true,
      receiverEmail: req.user.email  // Assuming req.user.email is available after authentication
    }).sort({ timestamp: -1 });

    res.status(200).json(announcements);
  } catch (err) {
    console.error('Retrieve announcements error:', err);
    res.status(500).send('Failed to retrieve announcements');
  }
});

module.exports = router;


module.exports = router;