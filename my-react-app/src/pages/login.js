// src/pages/login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css'; // Adjust this path as necessary to link to your styles.css

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(`Email: ${email}, Password: ${password}`);
        // Navigate to another route after successful login
        navigate('/');
    };

    return (
        <div className="signup-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                
                <button type="submit">Login</button>
            </form>
            <p><a href="/forgot-password">Forgot Password?</a></p>
            <p>Don't have an account? <a href="/signup">Sign up here</a></p>
        </div>
    );
};

export default Login;
