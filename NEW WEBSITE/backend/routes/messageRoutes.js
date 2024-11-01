const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming there's a User model
const Message = require('../models/Message'); // Assuming you have a Message model
const router = express.Router();

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
router.post('/send', authenticate, async (req, res) => {
  const { receiverId, content, isAnnouncement = false } = req.body;

  try {
    const senderId = req.user.userId;

    // Create and save the message
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
      isAnnouncement,
      timestamp: Date.now(),
    });

    await newMessage.save();

    res.status(200).send('Message sent');
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).send('Failed to send message');
  }
});

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
    const announcements = await Message.find({
      isAnnouncement: true,
      receiverId: req.user.userId
    }).sort({ timestamp: -1 });

    res.status(200).json(announcements);
  } catch (err) {
    console.error('Retrieve announcements error:', err);
    res.status(500).send('Failed to retrieve announcements');
  }
});

module.exports = router;
