import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProfileSettings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedCourses, setSelectedCourses] = useState(['CS 307', 'CS 381']);
  const navigate = useNavigate();

  const courses = ['CS 307', 'CS 381'];
  // Password complexity regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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


  const handleCourseChange = async (course) => {
    setSelectedCourses((prevSelectedCourses) => {
      const newSelectedCourses = prevSelectedCourses.includes(course)
        ? prevSelectedCourses.filter((c) => c !== course)
        : [...prevSelectedCourses, course];
      
      // Send updated course list to the backend
      updateCourses(newSelectedCourses);
      return newSelectedCourses;
    });
  };
  
  // Function to update courses on the backend
  const updateCourses = async (courses) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/update-courses', { courses }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error updating courses:', err);
      setError('Failed to update courses');
    }
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

      {/* Courses Section */}
      <div>
        <h3>Courses</h3>
        {courses.map((course) => (
          <div key={course}>
            <input
              type="checkbox"
              id={course}
              checked={selectedCourses.includes(course)} // Pre-selected checkboxes
              onChange={() => handleCourseChange(course)}
            />
            <label htmlFor={course}>{course}</label>
          </div>
        ))}
      </div>

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
