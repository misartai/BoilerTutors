import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MyCalendar from './CalendarDays'; // Import your CalendarDays component
import ProfessorCalendar from './ProfessorCalendar';
import Messaging from './Messaging';
import RateTutor from './RateTutor'; // Import your RateTutor component
import ReportAccount from './ReportAccount';
import ConfirmPayment from './ConfirmPayment';
import PayLedger from './PayLedger';
import ContactProf from './ContactProf'
import logo from '../boilerTutorsLogo.png';

import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard'); // State to manage current page
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

  // Function to render the appropriate component based on the current page
  const renderContent = () => {
    switch (currentPage) {
      case 'professorCalendar':
        return user && <ProfessorCalendar user={user} />;
      case 'calendar':
        return user && <MyCalendar user={user} />; // Pass the user object to MyCalendar
      case 'messages':
        return user && <Messaging user={user} />; //redirect user to Messages
      case 'rateTutor':
        return <RateTutor />;
      case 'confirmPayment':
        return <ConfirmPayment />;
      case 'reportAccount':
        return <ReportAccount />;
      case 'payLedger':
        return <PayLedger />;
      case 'contactProf':
        return <ContactProf />
  
      case 'dashboard':
      default:
        return (
          <div>
            <h1>Welcome, {user.name}</h1>
            <p>Email: {user.email}</p>
          </div>
        );
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');  // Remove token from localStorage
    navigate('/');  // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to the Dashboard</h1>

      {/* Navigation Links */}
      <nav className="navbar">
        <div className="nav-container">
          <img
               src={logo}
               alt="BoilerTutors Logo"
               className="navbar-logo"
               onClick={() => setCurrentPage('dashboard')}
          />
          <button onClick={() => setCurrentPage('calendar')}>View Calendar</button>
          <button onClick={() => setCurrentPage('professorCalendar')}>View Professor Calendar</button>
          <button onClick={() => setCurrentPage('messages')}>View Messages</button>
          <button onClick={() => setCurrentPage('rateTutor')}>Rate A Tutor</button>
          <button onClick={() => setCurrentPage('contactProf')}>Contact A Professor</button>
          {user.isTutor && <button onClick={() => setCurrentPage('confirmPayment')}>Confirm Payment</button>}
          {user.isTutor && <button onClick={() => setCurrentPage('reportAccount')}>Report An Account</button>}
          {user.isTutor && <button onClick={() => setCurrentPage('payLedger')}>View Pay Ledger</button>}
          <button onClick={() => navigate('/settings')}>Change Profile Settings</button>
          </div>

          <div className="nav-container-signOut">
              <button onClick={handleSignOut}>Sign Out</button>
          </div>
      </nav>

      {/* Render the content based on current page selection */}
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;