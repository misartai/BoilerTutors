import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
} from 'react-router-dom';
import {
        useEffect,
        useState
} from 'react';
import './App.css';
import Home from './pages/Home';
import DiscussionBoard from './pages/discussionBoard';
import RateTutor from './pages/rateTutor.js';
import Calendar from './pages/CalendarDays.js'
import Login from './pages/login.js'
import Signup from './pages/signup.js'
import ReportAccount from './pages/reportAccount.js'
import ConfirmPayment from './pages/confirmPayment.js'
import ReportDetails from './pages/reportDetails.js'
import Messaging from './pages/messaging/messaging.js'
import axios from 'axios';

function Layout() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to the App</h1>
        <nav>
          <Link to="/">Home</Link>{' '}|{' '}
          <Link to="/discussion-board">Discussion Board</Link>{' '}|{' '}
          <Link to="/rate-tutor">Rate Tutor</Link>{' '}|{' '}
          <Link to="/calendar">Calendars</Link>{' '}|{' '}
          <Link to="/login">Login</Link>{' '}|{' '}
          <Link to="/signup">SignUp</Link>{' '}|{' '}
          <Link to="/report-account">Report Account</Link>{' '}|{' '}
          <Link to="/confirm-payment">Confirm Payment</Link>{' '}|{' '}
          <Link to="/messaging">Messaging </Link>
        </nav>
      </header>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="discussion-board" element={<DiscussionBoard />} />
          <Route path="rate-tutor" element={<RateTutor />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="report-account" element={<ReportAccount />} />
          <Route path="report-account/:trackingId" element={<ReportDetails />} /> 
          <Route path="confirm-payment" element={<ConfirmPayment />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

const Conversation = ({ senderId, receiverId }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:8080/messages/conversation', {
                    params: {
                        senderId,
                        receiverId
                    }
                });
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching conversation:', error);
            }
        };

        fetchMessages();
    }, [senderId, receiverId]);

    return (
        <div>
            {messages.map((message) => (
                <p key={message.id}>{message.content}</p>
            ))}
        </div>
    );
};


export default App;
