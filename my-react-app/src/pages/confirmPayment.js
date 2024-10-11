import React from 'react';
import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa'; 
//import './rateTutor.css';

const ConfirmPayment = () => {
    // State to manage payment status and notifications
    const [paymentStatus, setPaymentStatus] = useState('Pending');
    const [notification, setNotification] = useState('');
    const [showDetails, setShowDetails] = useState(false);
  
    // Function to handle payment confirmation
    const confirmPayment = () => {
      setPaymentStatus('Confirmed');
      setNotification('Payment confirmed by tutor.');
      setShowDetails(false);
    };
  
    // Function to handle payment denial
    const denyPayment = () => {
      setPaymentStatus('Denied');
      setNotification('Payment denied by tutor.');
      setShowDetails(true);
    };
  
    return (
      <div className="payment-container">
        <h1>Payment Ledger</h1>
  
        {/* Session Payment Details */}
        <div className="session">
          <h2>Session ID: 12345</h2>
          <p>Student: John Doe</p>
          <p>Payment Status: <strong>{paymentStatus}</strong></p>
  
          {/* Confirm/Deny Payment Buttons */}
          <div className="button-container">
            <button className="confirm-btn" onClick={confirmPayment}>Confirm Payment</button>
            <button className="deny-btn" onClick={denyPayment}>Deny Payment</button>
          </div>
  
          {/* Notification for Student */}
          {notification && (
            <div className="notification">
              <p>{notification}</p>
            </div>
          )}
  
          {/* Additional Details Section when Payment is Denied */}
          {showDetails && (
            <div className="additional-details">
              <h3>Provide further details:</h3>
              <textarea
                className="details-textbox"
                placeholder="Explain why the payment was denied..."
              />
            </div>
          )}
        </div>
      </div>
    );
  };
  


export default ConfirmPayment;