import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

export default function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    email: '',
    tutorName: '',
    notifyTime: '1 hour',
    optInNotifications: true,
  });
  const [tutors, setTutors] = useState([]); // State to hold unique tutor names
  const [selectedTutor, setSelectedTutor] = useState(''); // State to hold selected tutor for filtering

  // Generate time intervals for selection
  const generateTimeIntervals = (start, end) => {
    const intervals = [];
    let currentTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    while (currentTime <= endTime) {
      intervals.push(currentTime.toTimeString().substring(0, 5));
      currentTime.setMinutes(currentTime.getMinutes() + 30); // Increment by 60 minutes
    }

    return intervals;
  };

  const timeOptions = generateTimeIntervals('08:00', '20:00'); // Example: from 8 AM to 8 PM

  // Fetch events and unique tutor names from the server when the component mounts
  useEffect(() => {
    fetch('http://localhost:3001/events')
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);

        // Extract unique tutor names
        const uniqueTutors = Array.from(new Set(data.map(event => event.tutorName)));
        setTutors(uniqueTutors); // Store unique tutor names in state
      })
      .catch((error) => console.error('Error fetching events:', error));
  }, []);

  // Filter available start times based on events
  const filterAvailableStartTimes = (date, events) => {
    const bookedStartTimes = events
      .filter((event) => event.start.includes(date))
      .map((event) => event.start.split('T')[1]);

    return timeOptions.filter((time) => !bookedStartTimes.includes(time));
  };

  // Filter available end times based on selected start time and events
  const filterAvailableEndTimes = (date, events, selectedStartTime) => {
    const bookedEndTimes = events
      .filter((event) => event.end.includes(date))
      .map((event) => event.end.split('T')[1]);

    return timeOptions
      .filter((time) => time > selectedStartTime) // Only show end times after selected start time
      .filter((time) => !bookedEndTimes.includes(time)); // Exclude already booked end times
  };

  // Get available start and end times
  const availableStartTimes = filterAvailableStartTimes(formData.date, events);
  const availableEndTimes = filterAvailableEndTimes(formData.date, events, formData.startTime);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission to add a new event
  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      title: `${formData.title} (${formData.startTime} - ${formData.endTime})`,
      start: `${formData.date}T${formData.startTime}`,
      end: `${formData.date}T${formData.endTime}`,
      email: formData.email,
      tutorName: formData.tutorName,
      notifyTime: formData.notifyTime,
      optInNotifications: formData.optInNotifications,
    };

    fetch('http://localhost:3001/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    })
      .then((response) => response.json())
      .then((data) => {
        setEvents([...events, data]); // Add the new event to the state
      })
      .catch((error) => console.error('Error adding event:', error));

    // Reset form data
    setFormData({
      title: '',
      date: formData.date,
      startTime: '',
      endTime: '',
      email: '',
      tutorName: '',
      notifyTime: '1 hour',
      optInNotifications: true,
    });
  };

  // Filter events by selected tutor
  const filteredEvents = selectedTutor
    ? events.filter(event => event.tutorName === selectedTutor)
    : events; // Show all events if no tutor is selected

  return (
    <div className="calendar-container">
      <div>
        <label>Filter by Tutor:</label>
        <select onChange={(e) => setSelectedTutor(e.target.value)} value={selectedTutor}>
          <option value="">All Tutors</option>
          {tutors.map((tutor) => (
            <option key={tutor} value={tutor}>{tutor}</option>
          ))}
        </select>
      </div>
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
            <input
              type="text"
              name="tutorName"
              value={formData.tutorName}
              onChange={handleInputChange}
              required
            />
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
              {availableStartTimes.map((time) => (
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
              {availableEndTimes.map((time) => (
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
    </div>
  );
}
