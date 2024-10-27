import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function EmailVerification() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');  // Get the email from the query string

  // Handle form submission for verification code
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/verify-email', { email, confirmationCode: code });
      const { token, validAccount } = response.data;

      // Save the token in localStorage
      localStorage.setItem('token', token);

      if (validAccount === false) {
        setMessage('Email verified successfully. Redirecting...');
        setTimeout(() => {
          navigate('/pending-approval');  // Redirect to a "Pending Approval" page
        }, 1300);  // Wait for 1 seconds before redirecting
      } else {
        setMessage('Email verified successfully. Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');  // Redirect to a "Pending Approval" page
        }, 1300);
      }
    } catch (err) {
      setError('Invalid confirmation code. Please try again.');
    }
  };

  // Handle resending the email
  const handleResend = async () => {
    try {
      await axios.post('/api/auth/resend-email', { email });
      setMessage('Verification email resent. Please check your inbox.');
    } catch (err) {
      setError('Error resending verification email. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Email Verification</h2>
      <p>A confirmation code has been sent to <strong>{email}</strong>. Please enter it below.</p>
      
      <input
        type="text"
        placeholder="Enter verification code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      
      <button type="submit">Submit</button>
      
      <button type="button" onClick={handleResend}>
        Resend Verification Email
      </button>

      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default EmailVerification;
