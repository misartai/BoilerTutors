// models/Draft.js
const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  content: { type: String, required: true },
  createdTime: { type: Date, default: Date.now },
});

const Draft = mongoose.model('Draft', draftSchema);

module.exports = Draft;