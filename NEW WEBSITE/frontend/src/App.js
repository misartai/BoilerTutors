import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CourseDetails from './components/CourseDetails';
import DiscussionBoard from './components/DiscussionBoard';
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
import ConfirmPayment from './components/ConfirmPayment';
import ReportAccount from './components/ReportAccount';
import PayLedger from './components/PayLedger';
import ProtectedRoute from './components/Protectedroute';
import Messaging from './components/Messaging';


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
        <Route path="/confirm-payment" element={<ConfirmPayment />} />
        <Route path="/report-account" element={<ReportAccount />} />
        <Route path="/pay-ledger" element={<PayLedger />} />
        <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/discussion-board" element={
          <ProtectedRoute>
            <DiscussionBoard />
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
        <Route path="/courses/:courseId" element={<CourseDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
