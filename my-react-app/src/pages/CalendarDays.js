import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

export default function MyCalendar() {
  // State declarations
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    email: '',  // Add email to form data
  });

  // Fetch events from the server when the component mounts
  useEffect(() => {
    fetch('http://localhost:3001/events')
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error('Error fetching events:', error));
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission to add a new event
  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      title: `${formData.title} (${formData.startTime} - ${formData.endTime})`,
      start: `${formData.date}T${formData.startTime}`,
      end: `${formData.date}T${formData.endTime}`,
      email: formData.email,  // Send email along with event
    };

    // Send new event to the server
    fetch('http://localhost:3001/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    })
      .then((response) => response.json())
      .then((data) => {
        setEvents([...events, data]);  // Update state with the new event
      })
      .catch((error) => console.error('Error adding event:', error));

    // Reset form data
    setFormData({
      title: '',
      date: formData.date,
      startTime: '',
      endTime: '',
      email: '',  // Reset email field
    });
  };

  // Handle date click to select a date from the calendar
  const handleDateClick = (info) => {
    setFormData({
      ...formData,
      date: info.dateStr,
    });
  };

  // Generate time intervals for selection
  const generateTimeIntervals = (start, end) => {
    const intervals = [];
    let currentTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    while (currentTime <= endTime) {
      intervals.push(currentTime.toTimeString().substring(0, 5));
      currentTime.setMinutes(currentTime.getMinutes() + 60);
    }

    return intervals;
  };

  const timeOptions = generateTimeIntervals('08:00', '20:00');

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
      .filter((time) => time > selectedStartTime)
      .filter((time) => !bookedEndTimes.includes(time));
  };

  const availableStartTimes = filterAvailableStartTimes(formData.date, events);
  const availableEndTimes = filterAvailableEndTimes(
    formData.date,
    events,
    formData.startTime
  );

  return (
    <div className="calendar-container">
      <div className="calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          events={events}
          dateClick={handleDateClick}
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
          <button type="submit">Book Appointment</button>
        </form>
      </div>
    </div>
  );
}