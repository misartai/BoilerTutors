import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MyCalendar from './CalendarDays'; // Import your CalendarDays component
import ProfessorCalendar from './ProfessorCalendar';
import Messaging from './Messaging';
import RateTutor from './RateTutor'; // Import your RateTutor component
import ReportAccount from './ReportAccount';
import ConfirmPayment from './ConfirmPayment';
import PayLedger from './PayLedger';
import ContactProf from './ContactProf'


function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard'); // State to manage current page

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

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>

      {/* Navigation Links */}
      <nav>
        <button onClick={() => setCurrentPage('dashboard')}>Dashboard</button>{' '}
        <button onClick={() => setCurrentPage('calendar')}>Calendar</button>{' '}
        <button onClick={() => setCurrentPage('professorCalendar')}>Professor Calendar</button>{' '}
        <button onClick={() => setCurrentPage('messages')}>Messaging</button>{' '}
        <button onClick={() => setCurrentPage('rateTutor')}>Rate Tutor</button>{' '}
        <button onClick={() => setCurrentPage('contactProf')}>Contact Professors</button>{' '}
        {/* Show the Confirm Payment button only if the user is a tutor */}
        {user.isTutor && (
          <button onClick={() => setCurrentPage('confirmPayment')}>Confirm Payment</button>
        )}
        {user.isTutor && (
          <button onClick={() => setCurrentPage('reportAccount')}>Report Account</button>
        )}
        {user.isTutor && (
          <button onClick={() => setCurrentPage('payLedger')}>Pay Ledger</button>
        )}

        {/* Add other navigation buttons here as needed */}
      </nav>

      {/* Render the content based on current page selection */}
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;