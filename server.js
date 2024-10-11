const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json()); // for parsing application/json

// MongoDB connection using hard-coded URI
const uri = 'mongodb+srv://agraw185:Boiler%402024@cluster0.v6qhp.mongodb.net/discussionBoardApp?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Discussion Post Schema with replies
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  createdAt: { type: Date, default: Date.now },
  replies: [
    {
      content: String,
      author: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

const Post = mongoose.model('Post', postSchema);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'boilertutors420@gmail.com',
    pass: 'zins bweo neuh zzgz', // App Password
  },
});

// Discussion Board: Fetch all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error); // Log the error
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Discussion Board: Add a new post
app.post('/posts', async (req, res) => {
  const newPost = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
  });

  try {
    const savedPost = await newPost.save();
    res.json(savedPost);

    // Send email notification to a specific email (shivliagrawal14@gmail.com)
    const mailOptions = {
      from: 'boilertutors420@gmail.com',
      to: 'shivliagrawal14@gmail.com',
      subject: 'New Post Created',
      text: `Dear user,\n\nA new post titled "${req.body.title}" has been successfully created.\n\nThank you for contributing!`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending post creation email:', err);
      } else {
        console.log('Post creation email sent:', info.response);
      }
    });
  } catch (error) {
    console.error('Error saving post:', error); // Log the error
    res.status(500).json({ error: 'Error saving post' });
  }
});

// Add a reply to a post
app.post('/posts/:id/replies', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    post.replies.push({ content: req.body.content, author: req.body.author });
    const updatedPost = await post.save();
    res.json(updatedPost);

    // Send email notification for new reply to specific email (shivliagrawal14@gmail.com)
    const mailOptions = {
      from: 'boilertutors420@gmail.com',
      to: 'shivliagrawal14@gmail.com',
      subject: 'New Reply to a Post',
      text: `Dear user,\n\nA post titled "${post.title}" has received a new reply.\n\nReply: ${req.body.content}\n\nThank you for contributing!`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending reply notification email:', err);
      } else {
        console.log('Reply notification email sent:', info.response);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding reply' });
  }
});

// Edit a post
app.put('/posts/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
      },
      { new: true }
    );
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Error updating post' });
  }
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting post' });
  }
});

// Start the server on a different port (3000) to avoid conflict
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
