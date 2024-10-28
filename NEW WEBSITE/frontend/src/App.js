import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import Messaging from './components/messaging';

function App() {
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
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/messaging" element={
                    <ProtectedRoute>
                      <Messaging />
                    </ProtectedRoute>
                  }
                />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
