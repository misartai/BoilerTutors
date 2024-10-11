const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // for parsing application/json

// MongoDB connection using your Atlas URI
const uri = 'mongodb+srv://sgokavar:boilertutors@cluster0.54tnq.mongodb.net/boilertutors?retryWrites=true&w=majority';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Review Schema
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  content: { type: String, required: true },
});

const Review = mongoose.model('Review', reviewSchema);

// Fetch all reviews
app.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Add a new review
app.post('/reviews', async (req, res) => {
  const newReview = new Review({
    rating: req.body.rating,
    content: req.body.content,
  });

  try {
    const savedReview = await newReview.save();
    res.json(savedReview);
  } catch (error) {
    res.status(500).json({ error: 'Error saving review' });
  }
});

// Delete a review
app.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting review' });
  }
});

// Start the server
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
