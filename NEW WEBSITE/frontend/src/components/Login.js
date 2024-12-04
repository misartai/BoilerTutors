import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './styles.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send POST request to the login route
      const response = await axios.post('/api/auth/login', { email, password });

      // Save the JWT token in localStorage
      localStorage.setItem('token', response.data.token);

      // Redirect to the dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Your account is pending approval.');
      } else if (err.response && err.response.status === 401) {
        setError('Invalid email, no user of this email exists.');
      } else {
        setError('Incorrect Password.');
      }
    }
  };

  return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
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
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
      <p>
        <Link to="/forgot-password">Forgot Password?</Link>  {/* Add forgot password link */}
      </p>
      <p>Don't have an account? <Link to="/signup">Sign-up here</Link></p>
    </form>
    </div>
  );
}

export default Login;
