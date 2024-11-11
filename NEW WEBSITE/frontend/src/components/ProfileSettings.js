import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProfileSettings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTutor, setIsTutor] = useState(false); // Tutor mode state
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Password complexity regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsTutor(response.data.isTutor); // Set initial tutor status from user data
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  // Handle tutor mode submission
  const handleSubmitTutor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/auth/update-tutor-status',
        { isTutor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Tutor mode ${isTutor ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      console.error('Error updating tutor status:', err);
      setError('Failed to update tutor status');
    }
  };

  // Update name
  const handleNameUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/update-profile', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Name updated successfully');
    } catch (err) {
      setError('Failed to update name. Please try again.');
    }
  };

  // Update email
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/update-profile', { email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Email updated successfully');
    } catch (err) {
      setError('Failed to update email. Please try again.');
    }
  };

  // Update password
  const handlePasswordUpdate = async (e) => {
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
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/update-profile', { password }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Password updated successfully');
    } catch (err) {
      setError('Failed to update password. Please try again.');
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/auth/delete-account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear localStorage and redirect to login or home
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };


  return (
    <div>
      <h2>Profile Settings</h2>

      {/* Update Name */}
      <form onSubmit={handleNameUpdate}>
        <h3>Update Name</h3>
        <input
          type="text"
          placeholder="New name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Update Name</button>
      </form>

      {/* Update Email */}
      <form onSubmit={handleEmailUpdate}>
        <h3>Update Email</h3>
        <input
          type="email"
          placeholder="New email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Update Email</button>
      </form>

      {/* Update Password */}
      <form onSubmit={handlePasswordUpdate}>
        <h3>Update Password</h3>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Update Password</button>
      </form>

      {/* Tutor Mode Toggle */}
      <div style={{ border: '1px solid #ccc', padding: '15px', margin: '15px 0' }}>
        <h3>Tutor Mode</h3>
        <label>
          <input
            type="checkbox"
            checked={isTutor}
            onChange={() => setIsTutor(!isTutor)}
          />
          Enable Tutor Mode
        </label>
        <button onClick={handleSubmitTutor} style={{ marginLeft: '10px' }}>
          Submit
        </button>
      </div>

      {/* Go Back to Dashboard Button */}
      <button onClick={handleBackToDashboard} style={{ marginTop: '20px', display: 'block' }}>
        Back to Dashboard
      </button>

      {/* Delete Account Button */}
      <button onClick={handleDeleteAccount} style={{ color: 'red', marginTop: '20px' }}>
        Delete Account
      </button>

      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default ProfileSettings;
