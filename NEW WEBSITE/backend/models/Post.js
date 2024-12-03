// NEW WEBSITE/backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Author reference to User
  createdAt: { type: Date, default: Date.now },
  replies: [
    {
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  // Add the visibility field
  visibility: {
    type: String,
    enum: ['everyone', 'only_me'],
    default: 'everyone',
  },
  isFavourite: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 }, // New field for upvotes
  downvotes: { type: Number, default: 0 }, // New field for downvotes
});

module.exports = mongoose.model('Post', postSchema);

