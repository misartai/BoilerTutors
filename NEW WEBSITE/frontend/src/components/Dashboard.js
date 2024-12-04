import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MyCalendar from './CalendarDays'; // Import your CalendarDays component
import ProfessorCalendar from './ProfessorCalendar';
import DiscussionBoard from './DiscussionBoard';
import Settings from './ProfileSettings';
import Messaging from './Messaging';
import RateTutor from './RateTutor'; // Import your RateTutor component
import ReportAccount from './ReportAccount';
import ConfirmPayment from './ConfirmPayment';
import PayLedger from './PayLedger';
import ContactProf from './ContactProf'
import logo from '../boilerTutorsLogo.png';
import CreateCourse from './CreateCourse';
import AddCourse from './AddCourse';
import TutorCourse from './TutorCourse';


import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard'); // State to manage current page
  const [coursesNames, setCourseNames] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [tutoringCourses, setTutoringCourses] = useState([]);
  const navigate = useNavigate();
  let popUpTimeout, logoutTimeout;

  const handleSignOut = () => {
    localStorage.removeItem('token');  // Remove token from localStorage
    navigate('/');  // Redirect to login page
  };

  const startInactivityTimers = () => {
    const threeHours = 3 * 60 * 60 * 1000; // 3 hours
    const fourHours = 4 * 60 * 60 * 1000; // 4 hours

    // Pop-up timer
    popUpTimeout = setTimeout(() => {
      const userResponse = window.confirm("You've been inactive for 3 hours. Press OK to continue.");
      if (userResponse) {
        resetInactivityTimers(); // Reset timers on interaction
      }
    }, threeHours);

    // Logout timer
    logoutTimeout = setTimeout(() => {
      alert("You have been logged out due to inactivity.");
      handleSignOut(); // Perform logout
    }, fourHours);
  };

  // Reset the inactivity timer
  const resetInactivityTimers = () => {
    clearTimeout(popUpTimeout);
    clearTimeout(logoutTimeout);
    startInactivityTimers();
  };

  useEffect(() => {
    const fetchUserAndCourses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        // Fetch user data
        const userResponse = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUser = userResponse.data;
        setUser(fetchedUser);

        // Fetch courses if user is a professor
        console.log('Courses fetched error');
        const courseResponse = await axios.get(`http://localhost:5000/api/courses`);
        setCourseNames(courseResponse.data);

        if (fetchedUser.accountType === 'student') {
          const studentCourses = courseResponse.data.filter(course =>
            fetchedUser.enrolledCourses.includes(course._id)
          );
          console.log('Courses enrolled:', studentCourses);
          setEnrolledCourses(studentCourses);
        }
        console.log('Courses fetched:', courseResponse.data);

        if (fetchedUser.isTutor) {
          const tutorCourses = courseResponse.data.filter(course =>
            fetchedUser.tutorCourses.includes(course._id)
          );
          setTutoringCourses(tutorCourses);
        }

      } catch (err) {
        console.error(err);
        setError('Failed to load user data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndCourses();
    startInactivityTimers();
    window.addEventListener('mousemove', resetInactivityTimers);
    window.addEventListener('keydown', resetInactivityTimers);

    return () => {
      clearTimeout(popUpTimeout);
      clearTimeout(logoutTimeout);
      window.removeEventListener("mousemove", resetInactivityTimers);
      window.removeEventListener("keydown", resetInactivityTimers);
    };
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`); // Redirect to the course details page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Function to render the appropriate component based on the current page
  const renderContent = () => {
    switch (currentPage) {
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
      case 'createCourse':
        return user && <CreateCourse user={user} />;
      case 'addCourse':
        return user && <AddCourse user={user} onReturn={() => setCurrentPage('dashboard')} />;
      case 'discussionBoard':
        return <DiscussionBoard />; // Render the DiscussionBoard 
      case 'tutorCourse':
        return user && <TutorCourse user={user} onReturn={() => setCurrentPage('dashboard')} />;
      case 'settings':
        return user && <Settings />;
  
      case 'dashboard':
      default:
        return (
          <div>
            <h1>Welcome, {user.name}</h1>
            <p>Email: {user.email}</p>
            <h2>Courses:</h2>
            {user?.accountType === 'professor' && (
              <div className="course-bubbles">
                {coursesNames.length > 0 ? (
                  coursesNames.map((course) => (
                    <button key={course._id} className="course-bubble" onClick={() => handleCourseClick(course._id)}>
                    {course.courseName}
                    </button>
                  ))
                )  : (
                  <p>No courses found.</p>
                )}
              </div>
            )}
            {user.accountType === 'student' && (
        <>
          <div className="course-bubbles">
            {enrolledCourses.map(course => (
              <button
                key={course._id}
                className="course-bubble"
                onClick={() => handleCourseClick(course._id)}
              >
                {course.courseName}
              </button>
            ))}
          </div>
        </>
      )}
      {/* Tutoring Courses Section */}
      {user.isTutor && tutoringCourses.length > 0 && (
        <>
          <h2>Tutoring Courses:</h2>
          <div className="course-bubbles">
            {tutoringCourses.map(course => (
              <button
                key={course._id}
                className="course-bubble"
                onClick={() => handleCourseClick(course._id)}
              >
                {course.courseName}
              </button>
            ))}
          </div>
        </>
      )}
          </div>
        );
    }
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
          <button onClick={() => setCurrentPage('messages')}>View Messages</button>
          <button onClick={() => setCurrentPage('rateTutor')}>Rate A Tutor</button>
          <button onClick={() => setCurrentPage('contactProf')}>Contact A Professor</button>
          {user.isTutor && <button onClick={() => setCurrentPage('confirmPayment')}>Confirm Payment</button>}
          {user.isTutor && <button onClick={() => setCurrentPage('reportAccount')}>Report An Account</button>}
          {user.accountType === 'professor' && <button onClick={() => setCurrentPage('createCourse')}>Create Course</button>}
          {user.accountType === 'student' && <button onClick={() => setCurrentPage('addCourse')}>Add Course</button>}
          {user.isTutor && <button onClick={() => setCurrentPage('payLedger')}>View Pay Ledger</button>}
          <button onClick={() => setCurrentPage('discussionBoard')}>Discussion Board</button>{' '}
          <button onClick={() => setCurrentPage('settings')}>Change Profile Settings</button>
          {user.isTutor && (<button onClick={() => setCurrentPage('tutorCourse')}>Tutor for Course</button>)}
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
