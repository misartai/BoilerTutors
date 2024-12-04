import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to BoilerTutors</h1>
        <p className="home-description">
          Access all your academic resources in one place. BoilerTutors combines tutoring services, syllabi, and other essential tools to help you succeed in your coursework.
        </p>
        <div className="home-buttons">
          <Link to="/signup" className="home-btn signup-btn">Sign Up</Link>
          <Link to="/login" className="home-btn login-btn">Login</Link>
        </div>
      </header>
      
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Appointment Scheduling</h3>
            <p>Schedule and manage your tutoring sessions effortlessly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Courses</h3>
            <p>Join course and get access to all course material.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Messaging</h3>
            <p>Communicate directly with tutors for personalized support.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Dicussion</h3>
            <p>Communicate with other students and staff to get help.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
