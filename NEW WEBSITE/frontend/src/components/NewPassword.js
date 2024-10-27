import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function NewPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  // Password complexity regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password complexity
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('/api/auth/reset-password', { email, password });

        // Check for account pending message from the server
        const { token , validAccount } = response.data;

        // Save the new token in localStorage
        localStorage.setItem('token', token);

        if (validAccount === false) {
            setMessage('Password reset successful. Redirecting...');
            setTimeout(() => {
                navigate('/pending-approval');  // Redirect to a "Pending Approval" page
            }, 1300);  // Wait for 1 seconds before redirecting
          } else {
            setMessage('Password reset successful. Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');  // Redirect to a "Pending Approval" page
            }, 1300)
        }

    } catch (err) {
        setError('Failed to reset password. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <button type="submit">Submit</button>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default NewPassword;
