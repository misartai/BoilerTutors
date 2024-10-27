import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function ConfirmationCode() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/verify-reset-code', { email, code });
      setMessage('Code verified. Redirecting...');
      setTimeout(() => {
        navigate(`/new-password?email=${email}`);
      }, 2000);  // Redirect to new password page
    } catch (err) {
      setError('Invalid code. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      await axios.post('/api/auth/resend-reset-code', { email });
      setMessage('Confirmation code resent.');
    } catch (err) {
      setError('Error resending the code.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter Confirmation Code</h2>
      <input
        type="text"
        placeholder="Enter code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={handleResend}>Resend Code</button>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default ConfirmationCode;
