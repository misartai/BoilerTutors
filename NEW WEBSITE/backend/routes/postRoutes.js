const express = require('express');
const Post = require('../models/Post');
const { authenticate } = require('./auth'); // Correctly import authenticate function
const router = express.Router();

// Create a new post
router.post('/create', authenticate, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = new Post({
      title,
      content,
      author: req.user.userId,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).send('Failed to create post');
  }
});

// Get all posts
router.get('/', authenticate, async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email'); // Populate author details
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).send('Failed to fetch posts');
  }
});

// Edit a post
router.put('/:id', authenticate, async (req, res) => {
  const { title, content } = req.body;
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    res.json(updatedPost);
  } catch (err) {
    res.status(500).send('Failed to update post');
  }
});

// Delete a post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).send('Failed to delete post');
  }
});

// Add a reply to a post
router.post('/:id/replies', authenticate, async (req, res) => {
  const { content } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    post.replies.push({
      content,
      author: req.user.userId,
    });
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).send('Failed to add reply');
  }
});

// Toggle favourite status of a post
router.put('/:id/favourite', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    post.isFavourite = !post.isFavourite;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).send('Failed to toggle favourite status');
  }
});

console.log(authenticate);

module.exports = router;
