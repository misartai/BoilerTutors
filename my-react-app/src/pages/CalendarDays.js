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
      title: `${formData.title} (${formData.startTime} - ${formData.endTime})`,
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

  const filterAvailableStartTimes = (date, events) => {
    const bookedStartTimes = events
      .filter((event) => event.start.includes(date))
      .map((event) => event.start.split('T')[1]);

    return timeOptions.filter((time) => !bookedStartTimes.includes(time));
  };

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
          <button type="submit">Book Appointment</button>
        </form>
      </div>
    </div>
  );
}
