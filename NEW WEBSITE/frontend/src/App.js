import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmailVerification from './components/EmailVerification';
import PendingApproval from './components/PendingApproval';
import ForgotPassword from './components/ForgottenPassword';
import ConfirmationCode from './components/ConfirmCode';
import NewPassword from './components/NewPassword';
import RateTutor from './components/RateTutor';
import ProtectedRoute from './components/Protectedroute';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/current-user', {
          method: 'GET',
          credentials: 'include', // Include cookies if needed for session
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setCurrentUser(userData); // Set the current user data
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/confirm-code" element={<ConfirmationCode />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/rate-tutor" element={<RateTutor />} />
        <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard currentUser={currentUser} /> {/* Pass currentUser to Dashboard */}
            </ProtectedRoute>
          }
        />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
