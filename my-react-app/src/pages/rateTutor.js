import React from 'react';
import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa'; 
import './rateTutor.css';

const RateTutor = () =>  {
  const [rating, setRating] = useState(0); // track selected star
  const [hover, setHover] = useState(null); // track hover star
  const [showTextBox, setShowTextBox] = useState(false); // show text box
  const [details, setDetails] = useState('');   

  const handleRating = (currentRating) => {
    setRating(currentRating);
    setShowTextBox(true);  // Show the text box after selecting a rating
  };

  return (
    <div>
      <h1>Rate/Review Tutor</h1>
      <div className="stars">
        {[...Array(5)].map((star, index) => {
          const currentRating = index + 1;
          return (
            <FaStar
              key={index}
              className="star"
              color={currentRating <= (hover || rating) ? 'gold' : 'gray'}  // Turn stars gold on hover or click
              size={40}
              onClick={() => handleRating(currentRating)}  // Set rating when clicked
              onMouseEnter={() => setHover(currentRating)}  // Track hover
              onMouseLeave={() => setHover(null)}  // Reset hover
              style={{ cursor: 'pointer' }}  // Make the star clickable
            />
          );
        })}
      </div>
      <p>You have rated {rating} stars.</p>

      {/* Conditionally render the text box after a rating is selected */}
      {showTextBox && (
        <div className="details">
          <h4 htmlFor="details">Please provide further details:</h4>
          <textarea
            id="details"
            rows="4"
            cols="50"
            value={details}
            onChange={(e) => setDetails(e.target.value)}  // Track input changes
            placeholder="Write your review here..."
          ></textarea>
        </div>
      )}
    </div>
  );
}
export default RateTutor;