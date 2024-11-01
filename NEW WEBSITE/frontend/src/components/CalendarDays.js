import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

export default function MyCalendar({ user }) {
  const { email: userEmail, isTutor } = user;
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    email: userEmail,
    tutorEmail: '',
    notifyTime: '1 hour',
    optInNotifications: true,
  });
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState('');
  const [viewMode, setViewMode] = useState('student');
  const [studentFilter, setStudentFilter] = useState('');
  const [eventNameFilter, setEventNameFilter] = useState('');
  const [studentEmails, setStudentEmails] = useState([]);
  const [psoEventNames, setPsoEventNames] = useState([]);

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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();

        setEvents(data);
        setStudentEmails([...new Set(data.map(event => event.email))]);

        // Extract unique event names for the PSO filter
        const uniquePsoEvents = data
          .filter(event => event.extendedProps?.eventType !== 'appointment') // Exclude appointments for PSO
          .map(event => event.title);
        setPsoEventNames([...new Set(uniquePsoEvents)]);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchTutors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tutors');
        if (!response.ok) throw new Error('Failed to fetch tutors');
        const data = await response.json();
        setTutors(data);
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };

    fetchEvents();
    fetchTutors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

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
      userEmail: formData.email,
      tutorName: formData.tutorEmail,
      notifyTime: formData.notifyTime,
      optInNotifications: formData.optInNotifications,
    };
    fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to create event');
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
            eventType: data.eventType,
          },
        }]);
        setFormData({
          title: '',
          date: formData.date,
          startTime: '',
          endTime: '',
          email: userEmail,
          tutorEmail: '',
          notifyTime: '1 hour',
          optInNotifications: true,
        });
      })
      .catch((error) => {
        console.error('Error adding event:', error);
        alert('There was an error booking the appointment. Please try again.');
      });
  };

  const filteredEvents = events.filter(event => {
    const tutorEmailInEvent = event.extendedProps?.tutorName;
    const matchesTutor = selectedTutor ? tutorEmailInEvent === selectedTutor : true;
    const matchesStudent = studentFilter ? event.email === studentFilter : true;
    const matchesEventName = eventNameFilter ? event.title === eventNameFilter : true;

    // Automatically filter for PSO view
    const matchesEventType =
      viewMode === 'pso'
        ? event.extendedProps?.eventType === 'pso' || event.extendedProps?.eventType === 'office' // Show only PSO and Office events in PSO view
        : true; // Show all events in student view

    return matchesTutor && matchesStudent && matchesEventName && matchesEventType;
  });

  const renderEventContent = (eventInfo) => {
    const startTime = eventInfo.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = eventInfo.event.end ? eventInfo.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return (
      <div>
        <b>{eventInfo.event.title}</b>
        <div>{startTime} - {endTime}</div>
        <div className={`event-type ${eventInfo.event.extendedProps.eventType}`}>
          {eventInfo.event.extendedProps.eventType}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', width: '100%' }}>
          <label style={{ marginRight: '5px' }}>View Mode:</label>
          <select onChange={(e) => setViewMode(e.target.value)} value={viewMode}>
            <option value="student">Student View</option>
            {isTutor && <option value="tutor">Tutor View</option>}
            <option value="pso">PSO/Office Hours View</option>
          </select>

          {viewMode === 'pso' ? (
            <>
              <label style={{ marginRight: '5px', marginLeft: '10px' }}>Filter by Event Name:</label>
              <select value={eventNameFilter} onChange={(e) => setEventNameFilter(e.target.value)}>
                <option value="">All Events</option>
                {psoEventNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          ) : viewMode === 'student' ? (
            <>
              <label style={{ marginRight: '5px', marginLeft: '10px' }}>Filter by Tutor Email:</label>
              <select onChange={(e) => setSelectedTutor(e.target.value)} value={selectedTutor}>
                <option value="">All Tutors</option>
                {tutors.map((tutor) => (
                  <option key={tutor._id} value={tutor.email}>
                    {tutor.email} {/* Displaying tutor email */}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label style={{ marginRight: '5px', marginLeft: '10px' }}>Filter by Student Email:</label>
              <select onChange={(e) => setStudentFilter(e.target.value)} value={studentFilter}>
                <option value="">All Students</option>
                {studentEmails.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div className="calendar" style={{ flexGrow: 1 }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              events={filteredEvents}
              dateClick={(info) => setFormData({ ...formData, date: info.dateStr })}
              displayEventTime={true}
              eventContent={renderEventContent}
              headerToolbar={{
                left: 'today prev,next',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
            />
          </div>

          {viewMode === 'student' && (
            <div className="booking-form" style={{ width: '30%', marginLeft: '20px' }}>
              <h2>Book an Event</h2>
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Title:</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div>
                  <label>Tutor Email:</label>
                  <select name="tutorEmail" value={formData.tutorEmail} onChange={handleInputChange} required>
                    <option value="">Select Tutor</option>
                    {tutors.map((tutor) => (
                      <option key={tutor._id} value={tutor.email}>
                        {tutor.email} {/* Displaying tutor email */}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Date:</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                </div>
                <div>
                  <label>Start Time:</label>
                  <select name="startTime" value={formData.startTime} onChange={handleInputChange} required>
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
                  <select name="endTime" value={formData.endTime} onChange={handleInputChange} required>
                    <option value="">Select End Time</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
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
                <button type="submit">Book Event</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
