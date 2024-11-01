import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import './rateTutor.css';

const RateTutor = () => {
  const [tutors, setTutors] = useState([]); // List of tutors
  const [selectedTutor, setSelectedTutor] = useState(''); // Selected tutor ID
  const [reviews, setReviews] = useState([]); // Reviews for the selected tutor
  const [newRating, setNewRating] = useState(0); // Star rating
  const [newReviewContent, setNewReviewContent] = useState('');
  const [averageRating, setAverageRating] = useState(null); // Average rating

  // Fetch all tutors on component mount
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tutors');
        setTutors(response.data);
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };
  
    fetchTutors();
  }, []);
  
  // Fetch reviews and average rating for the selected tutor
  useEffect(() => {
    if (selectedTutor) {
      const fetchTutorData = async () => {
        try {
          // Fetch tutor reviews
          const reviewsResponse = await axios.get(`http://localhost:5000/tutors/${selectedTutor}/reviews`);
          setReviews(reviewsResponse.data);

          // Fetch tutor information to get average rating
          const tutorResponse = await axios.get(`http://localhost:5000/tutors/${selectedTutor}`);
          setAverageRating(tutorResponse.data.averageRating);
        } catch (error) {
          console.error('Error fetching reviews or tutor data:', error);
        }
      };
      fetchTutorData();
    } else {
      // Reset average rating and reviews if no tutor is selected
      setAverageRating(null);
      setReviews([]);
    }
  }, [selectedTutor]);

  // Submit a new review for the selected tutor
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating && newReviewContent && selectedTutor) {
      const newReview = {
        rating: newRating,
        content: newReviewContent,
      };

      try {
        // Submit the new review
        await axios.post(`http://localhost:5000/tutors/${selectedTutor}/reviews`, newReview);
        
        // Refresh the reviews and average rating after submitting
        const reviewsResponse = await axios.get(`http://localhost:5000/tutors/${selectedTutor}/reviews`);
        setReviews(reviewsResponse.data);

        const tutorResponse = await axios.get(`http://localhost:5000/tutors/${selectedTutor}`);
        setAverageRating(tutorResponse.data.averageRating);
      } catch (error) {
        console.error('Error submitting review:', error);
      }

      // Reset new review inputs
      setNewRating(0);
      setNewReviewContent('');
    }
  };

  return (
    <div>
      <h1 className="web-name">Rate a Tutor</h1>

      {/* Tutor selection */}
      <label>Select a Tutor:</label>
      <select 
        value={selectedTutor} 
        onChange={(e) => setSelectedTutor(e.target.value)} 
        style={{ width: '300px', padding: '5px', border: '1px solid gray', borderRadius: '5px' }}
      >
        <option value="">--Select a Tutor--</option>
        {tutors.map((tutor) => (
          <option key={tutor._id} value={tutor._id}>
            {tutor.name}
          </option>
        ))}
      </select>

      {/* Display average rating */}
      {averageRating !== null && (
        <h2 style={{ fontSize: '24px' }}>Average Rating: {averageRating ? `${averageRating}/5` : 'N/A'}</h2>
      )}

      {/* Review form */}
      <form onSubmit={handleSubmitReview}>
        <h2>Submit Your Rating</h2>
        <div className="stars">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              size={30}
              className={index < newRating ? 'filled-star' : 'empty-star'}
              onClick={() => setNewRating(index + 1)}
            />
          ))}
        </div>
        <textarea
          value={newReviewContent}
          onChange={(e) => setNewReviewContent(e.target.value)}
          rows="5"
          cols="40"
          required
        />
        <button type="submit">Submit</button>
      </form>

      {/* Display reviews for the selected tutor */}
      <hr />
      <h2>Reviews for the Selected Tutor</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review, index) => (
          <div key={index}>
            <h3>Rating: {review.rating}/5</h3>
            <p>{review.content}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
};

export default RateTutor;