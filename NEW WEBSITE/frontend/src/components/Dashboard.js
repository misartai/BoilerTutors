import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MyCalendar from './CalendarDays';
import ProfessorCalendar from './ProfessorCalendar';
import Messaging from './Messaging';
import RateTutor from './RateTutor';
import ReportAccount from './ReportAccount';
import ConfirmPayment from './ConfirmPayment';
import PayLedger from './PayLedger';
import './Dashboard.css';
import { FaCalendarAlt, FaCommentDots, FaStar, FaWallet, FaFileInvoice, FaExclamationTriangle } from 'react-icons/fa';  // FontAwesome icons

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load user data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'professorCalendar':
        return <ProfessorCalendar user={user} />;
      case 'calendar':
        return <MyCalendar user={user} />;
      case 'messages':
        return <Messaging user={user} />;
      case 'rateTutor':
        return <RateTutor />;
      case 'confirmPayment':
        return <ConfirmPayment />;
      case 'reportAccount':
        return <ReportAccount />;
      case 'payLedger':
        return <PayLedger />;
      case 'home':
      default:
        return (
          <div className="home-page">
            <section className="description">
              <h1>Welcome to BoilerTutors</h1>
              <p>
                Access all your academic resources in one place. BoilerTutors combines tutoring services, syllabi, and other essential tools to help you succeed in your coursework.
              </p>
            </section>
            <section className="key-features">
              <h2>Key Features</h2>
              <div className="features-grid">
                <div className="feature-card" onClick={() => setCurrentPage('calendar')}>
                  <FaCalendarAlt size={40} />
                  <h3>Calendar</h3>
                  <p>Plan your schedule and book tutoring sessions effortlessly.</p>
                </div>
                <div className="feature-card" onClick={() => setCurrentPage('messages')}>
                  <FaCommentDots size={40} />
                  <h3>Messaging</h3>
                  <p>Stay connected with your tutors and peers through instant messaging.</p>
                </div>
                <div className="feature-card" onClick={() => setCurrentPage('rateTutor')}>
                  <FaStar size={40} />
                  <h3>Rate Tutors</h3>
                  <p>Share feedback and reviews for tutors to improve services.</p>
                </div>
                {user.isTutor && (
                  <>
                    <div className="feature-card" onClick={() => setCurrentPage('confirmPayment')}>
                      <FaWallet size={40} />
                      <h3>Confirm Payment</h3>
                      <p>Manage and confirm payments for completed sessions.</p>
                    </div>
                    <div className="feature-card" onClick={() => setCurrentPage('reportAccount')}>
                      <FaExclamationTriangle size={40} />
                      <h3>Report Account</h3>
                      <p>Report issues with student accounts for quick resolution.</p>
                    </div>
                    <div className="feature-card" onClick={() => setCurrentPage('payLedger')}>
                      <FaFileInvoice size={40} />
                      <h3>Pay Ledger</h3>
                      <p>Track and manage all payment transactions efficiently.</p>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        );
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard">
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <div className="logo">BoilerTutors</div>
        <nav className="navigation">
          <button onClick={() => setCurrentPage('home')}>Home</button>
          <button onClick={() => setCurrentPage('calendar')}>Calendar</button>
          <button onClick={() => setCurrentPage('professorCalendar')}>Professor Calendar</button>
          <button onClick={() => navigate('/settings')}>Profile Settings</button>
          <button onClick={() => setCurrentPage('messages')}>Messaging</button>
          <button onClick={() => setCurrentPage('rateTutor')}>Rate Tutor</button>
          {user.isTutor && <button onClick={() => setCurrentPage('confirmPayment')}>Confirm Payment</button>}
          {user.isTutor && <button onClick={() => setCurrentPage('reportAccount')}>Report Account</button>}
          {user.isTutor && <button onClick={() => setCurrentPage('payLedger')}>Pay Ledger</button>}
          <button onClick={handleSignOut}>Sign Out</button>
        </nav>
      </header>

      {/* Render content based on currentPage */}
      <main className="dashboard-content">{renderContent()}</main>
    </div>
  );
}

export default Dashboard;
