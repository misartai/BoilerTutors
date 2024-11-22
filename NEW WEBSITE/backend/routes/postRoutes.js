const express = require('express');
const Post = require('../models/Post');
const router = express.Router();
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).send('Access Denied');

  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = verified.userId;
    console.log('Authenticated user ID:', req.userId); // Debugging statement
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

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

// Mark a post as viewed
router.put('/:id/markAsViewed', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;

    console.log('Marking post as viewed:', { userId, postId }); // Debugging statement

    await User.findByIdAndUpdate(userId, { $addToSet: { viewedPosts: postId } });

    res.json({ message: 'Post marked as viewed' });
  } catch (err) {
    console.error('Error in markAsViewed:', err); // Debugging statement
    res.status(500).send('Failed to mark post as viewed');
  }
});

// Get current user data
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('viewedPosts');
    res.json(user);
  } catch (err) {
    res.status(500).send('Failed to fetch user data');
  }
});

// Upvote a post
router.put('/:id/upvote', authenticate, async (req, res) => {
  console.log('Upvote route hit');
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    post.upvotes += 1;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).send('Failed to upvote post');
  }
});

// Downvote a post
router.put('/:id/downvote', authenticate, async (req, res) => {
  console.log('Downvote route hit');
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    post.downvotes += 1;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).send('Failed to downvote post');
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
