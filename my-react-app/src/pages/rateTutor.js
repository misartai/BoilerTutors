import React from 'react';
import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa'; 
import './rateTutor.css';

const RateTutor = () => {
  // Initialize reviews from localStorage
  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem('reviews');
    return savedReviews ? JSON.parse(savedReviews) : [];
  });

  const [newRating, setNewRating] = useState(0); // Star rating (1-5)
  const [newReviewContent, setNewReviewContent] = useState('');

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Handler for creating a new review
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newRating && newReviewContent) {
      const newReview = {
        rating: newRating,
        content: newReviewContent,
      };
      setReviews([...reviews, newReview]);
      setNewRating(0); // Reset rating
      setNewReviewContent(''); // Reset review content
    }
  };

  // Handle star click
  const handleStarClick = (starIndex) => {
    setNewRating(starIndex + 1); // Sets the rating based on which star was clicked (1-5)
  };

  // Delete review
  const handleDeleteReview = (indexToDelete) => {
    const updatedReviews = reviews.filter((_, index) => index !== indexToDelete);
    setReviews(updatedReviews);
  };

  // Calculate average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1) // Ensure rating is treated as a number
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
            <hr /> {/* Line separator between reviews */}
          </div>
        ))
      )}
    </div>
  );
};






export default RateTutor;