import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('student');
  const [isTutor, setIsTutor] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Password complexity regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate email domain (must end with "@purdue.edu")
    if (!email.endsWith('@purdue.edu')) {
      setError('Email must end with "@purdue.edu"');
      return;
    }

    // Validate password complexity
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
      return;
    }

    // Validate that passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Make the POST request to signup
      await axios.post('/api/auth/signup', { name, email, password, accountType, isTutor });

      // Redirect to email verification page
      navigate(`/verify-email?email=${email}`);
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data === 'Email already registered') {
        setError('Email already in use');
      } else {
        setError('Signup failed');
      }
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Signup</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Re-enter Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {/* Account Type Selection */}
      <label>
        <input
          type="radio"
          value="student"
          checked={accountType === 'student'}
          onChange={() => setAccountType('student')}
        />
        Student
      </label>
      <label>
        <input
          type="radio"
          value="professor"
          checked={accountType === 'professor'}
          onChange={() => setAccountType('professor')}
        />
        Professor
      </label>

      {/* Tutor Checkbox */}
      <label>
        <input
          type="checkbox"
          checked={isTutor}
          onChange={(e) => setIsTutor(e.target.checked)}  // Toggle tutor status
        />
        I want to become a tutor
      </label>

      {error && <p className="error">{error}</p>}
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default Signup;
