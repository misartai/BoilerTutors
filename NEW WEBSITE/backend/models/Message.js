const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true },
  recipientEmail: { type: String },
  content: { type: String, required: true },
  isAnnouncement: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;