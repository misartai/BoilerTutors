import React from 'react';
import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa'; 
import axios from 'axios';
import './rateTutor.css';

const RateTutor = () => {
  const [reviews, setReviews] = useState([]); // Fetch reviews from the server
  const [newRating, setNewRating] = useState(0); // Star rating (1-5)
  const [newReviewContent, setNewReviewContent] = useState('');

  // Fetch reviews from the server when the component loads
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:8080/reviews');
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  // Handler for creating a new review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating && newReviewContent) {
      const newReview = {
        rating: newRating,
        content: newReviewContent,
      };

      try {
        // Send the review to the server
        const response = await axios.post('http://localhost:8080/reviews', newReview);
        // Add the new review to the reviews list after a successful response
        setReviews([...reviews, response.data]);
      } catch (error) {
        console.error('Error submitting review:', error);
      }

      setNewRating(0); // Reset rating
      setNewReviewContent(''); // Reset review content
    }
  };

  // Handle star click
  const handleStarClick = (starIndex) => {
    setNewRating(starIndex + 1); // Sets the rating based on which star was clicked (1-5)
  };

  // Delete review
  const handleDeleteReview = async (indexToDelete) => {
    try {
      const reviewToDelete = reviews[indexToDelete];
      await axios.delete(`http://localhost:8080/reviews/${reviewToDelete._id}`);
      // Remove the review from the state
      const updatedReviews = reviews.filter((_, index) => index !== indexToDelete);
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div>
      <h1 className="web-name">Rate a Tutor</h1>

      <form onSubmit={handleSubmitReview}>
        <h2>Submit Your Rating</h2>
        <p>
          <label>
            Rating (out of 5):<br />
            <div className="stars">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  size={30}
                  className={index < newRating ? 'filled-star' : 'empty-star'}
                  onClick={() => handleStarClick(index)}
                />
              ))}
            </div>
          </label>
        </p>
        <p>
          <label>
            Review:<br />
            <textarea
              value={newReviewContent}
              onChange={(e) => setNewReviewContent(e.target.value)}
              rows="5"
              cols="40"
              required
            />
          </label>
        </p>
        <p>
          <button type="submit">Submit</button>
        </p>
      </form>

      <hr />

      <h2>Average Rating: {averageRating}/5</h2>
      <div className="average-rating-stars">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            size={30}
            className={index < Math.round(averageRating) ? 'filled-star' : 'empty-star'}
          />
        ))}
      </div>

      <hr />

      <h2>Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review, index) => (
          <div key={index}>
            <div className="review-card">
              <button className="delete-btn" onClick={() => handleDeleteReview(index)}>
                &times; {/* Display X for delete */}
              </button>
              <h2>Rating: {review.rating}/5</h2>
              <p>{review.content}</p>
            </div>
            <hr />
          </div>
        ))
      )}
    </div>
  );
};

export default RateTutor;
