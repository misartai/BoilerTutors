import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

export default function MyCalendar({ user }) {
  const { email: userEmail, isTutor } = user; // Destructure email and isTutor from user object
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    email: userEmail, // Pre-fill the email field with userEmail
    tutorName: '',
    notifyTime: '1 hour',
    optInNotifications: true,
  });
  const [tutors, setTutors] = useState([]); // State to store tutors
  const [selectedTutor, setSelectedTutor] = useState('');
  const [viewMode, setViewMode] = useState('student'); // State to toggle between views
  const [studentFilter, setStudentFilter] = useState('');

  // Generate time intervals for selection
  const generateTimeIntervals = (start, end) => {
    const intervals = [];
    let currentTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    while (currentTime <= endTime) {
      intervals.push(currentTime.toTimeString().substring(0, 5));
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return intervals;
  };

  const timeOptions = generateTimeIntervals('08:00', '20:00');

  // Fetch events and tutors from the server when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/events?userEmail=${userEmail}`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchTutors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tutors'); // Adjust the URL to fetch tutors
        if (!response.ok) {
          throw new Error('Failed to fetch tutors');
        }
        const data = await response.json();
        
        console.log('Fetched Tutors:', data); // Log the fetched tutor data
        
        // Filter tutors with isTutor set to true
        const filteredTutors = data.filter(tutor => tutor.isTutor);
        console.log('Filtered Tutors:', filteredTutors); // Log the filtered tutor data
        
        setTutors(filteredTutors); // Set the filtered tutors to state
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };

    fetchEvents();
    fetchTutors();
  }, [userEmail]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission to add a new event (only for students)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.endTime) {
      alert('Please select an end time.');
      return;
    }

    const newEvent = {
      title: formData.title,
      start: `${formData.date}T${formData.startTime}`,
      end: `${formData.date}T${formData.endTime}`,
      email: formData.email,
      userEmail: formData.email, // Include the user's email
      tutorName: formData.tutorName,
      notifyTime: formData.notifyTime,
      optInNotifications: formData.optInNotifications,
    };

    fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create event');
        }
        return response.json();
      })
      .then((data) => {
        setEvents([...events, {
          title: data.title,
          start: data.start,
          end: data.end,
          extendedProps: {
            email: data.email,
            tutorName: data.tutorName,
            notifyTime: data.notifyTime,
            optInNotifications: data.optInNotifications,
          },
        }]);
        setFormData({
          title: '',
          date: formData.date,
          startTime: '',
          endTime: '',
          email: userEmail, // Reset to userEmail
          tutorName: '',
          notifyTime: '1 hour',
          optInNotifications: true,
        });
      })
      .catch((error) => {
        console.error('Error adding event:', error);
        alert('There was an error booking the appointment. Please try again.');
      });
  };

  // Filter events by selected tutor and student name
  const filteredEvents = events.filter(event => {
    const matchesTutor = selectedTutor ? event.extendedProps.tutorName === selectedTutor : true;
    const matchesStudent = studentFilter ? event.email.includes(studentFilter) : true;
    return matchesTutor && matchesStudent;
  });

  return (
    <div className="calendar-container">
      <div>
        <label>View Mode:</label>
        <select onChange={(e) => setViewMode(e.target.value)} value={viewMode}>
          <option value="student">Student View</option>
          {isTutor && <option value="tutor">Tutor View</option>} {/* Only show for tutors */}
        </select>
      </div>

      {viewMode === 'student' && (
        <div>
          <label>Filter by Tutor:</label>
          <select onChange={(e) => setSelectedTutor(e.target.value)} value={selectedTutor}>
            <option value="">All Tutors</option>
            {tutors.map((tutor) => (
              <option key={tutor._id} value={tutor.name}>{tutor.name}</option> // Assuming tutor has a name property
            ))}
          </select>
        </div>
      )}

      {viewMode === 'tutor' && (
        <div>
          <label>Filter by Student Name:</label>
          <input 
            type="text" 
            value={studentFilter} 
            onChange={(e) => setStudentFilter(e.target.value)} 
            placeholder="Enter student name"
          />
        </div>
      )}

      <div className="calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          events={filteredEvents} // Use filtered events
          dateClick={(info) => setFormData({ ...formData, date: info.dateStr })}
          displayEventTime={false}
        />
      </div>

      {viewMode === 'student' && (
        <div className="booking-form">
          <h2>Book an Appointment</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Tutor Name:</label>
              <select
                name="tutorName"
                value={formData.tutorName}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Tutor</option>
                {tutors.map((tutor) => (
                  <option key={tutor._id} value={tutor.name}>{tutor.name}</option> // Assuming tutor has a name property
                ))}
              </select>
            </div>
            <div>
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Start Time:</label>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Start Time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>End Time:</label>
              <select
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              >
                <option value="">Select End Time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Reminder Time:</label>
              <select name="notifyTime" value={formData.notifyTime} onChange={handleInputChange}>
                <option value="1 hour">1 hour</option>
                <option value="30 minutes">30 minutes</option>
                <option value="15 minutes">15 minutes</option>
              </select>
            </div>
            <div>
              <label>Receive Notifications:</label>
              <input
                type="checkbox"
                name="optInNotifications"
                checked={formData.optInNotifications}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit">Book Appointment</button>
          </form>
        </div>
      )}
    </div>
  );
}
