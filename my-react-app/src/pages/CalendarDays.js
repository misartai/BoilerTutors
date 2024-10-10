import React, { useState } from 'react';
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
  });

  const handleDateClick = (info) => {
    setFormData({
      ...formData,
      date: info.dateStr,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      title: formData.title,
      start: `${formData.date}T${formData.startTime}`,
      end: `${formData.date}T${formData.endTime}`,
    };

    setEvents([...events, newEvent]);
    setFormData({
      title: '',
      date: formData.date,
      startTime: '',
      endTime: '',
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          events={events}
          dateClick={handleDateClick}
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
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>End Time:</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
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
