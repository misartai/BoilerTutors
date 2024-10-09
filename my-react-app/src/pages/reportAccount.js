import React from 'react';
import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom'; 
//import './rateTutor.css';

const ReportAccount = () => {
    const [showForm, setShowForm] = useState(false);  // To toggle form visibility
    const [studentId, setStudentId] = useState('');  // To track the student's ID
    const [details, setDetails] = useState('');  // To track report details
    const [trackingId, setTrackingId] = useState('');  // Generate tracking ID
    const navigate = useNavigate();
  
    // Function to handle form submission
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Generate a unique tracking ID (this could be more advanced in a real system)
      const newTrackingId = Math.random().toString(36).substring(2, 9);
      setTrackingId(newTrackingId);
  
      // Store the report in the payment ledger (you'll manage this in your backend or state)
      // For now, we'll just log it to the console
      console.log('Report submitted for student:', studentId);
      console.log('Details:', details);
      console.log('Tracking ID:', newTrackingId);
  
      // Hide the form after submission
      setShowForm(false);
  
      // Navigate to the details page after submission
      navigate(`/report-account/${newTrackingId}`);
    };
  
    return (
      <div>
        <h1>Report Student Account</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel Report' : 'Report Student Account'}
        </button>
  
        {/* Conditionally render the form when the button is clicked */}
        {showForm && (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="studentId">Student ID:</label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
  
            <div>
              <label htmlFor="details">Further Details:</label>
              <textarea
                id="details"
                rows="4"
                cols="50"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              />
            </div>
  
            <button type="submit">Submit Report</button>
          </form>
        )}
  
        {trackingId && (
          <div className="payment-ledger">
            <h2>Payment Ledger</h2>
            <p>
              Tracking ID: <span className="tracking-id">{trackingId}</span>
            </p>
          </div>
        )}
      </div>
    );
  };


export default ReportAccount;