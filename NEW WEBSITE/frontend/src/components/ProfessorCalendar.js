import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

export default function StaffCalendar({ user }) {
  const { email: userEmail } = user; // Destructure email from user object
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    email: userEmail, // Pre-fill the email field with userEmail
    staffEmail: '', // Use staffEmail instead of tutorName
    notifyTime: '1 hour',
    optInNotifications: true,
  });
  const [staffMembers, setStaffMembers] = useState([]); // State to store staff members
  const [selectedStaff, setSelectedStaff] = useState('');
  const [viewMode, setViewMode] = useState('student'); // State to toggle between views
  const [studentFilter, setStudentFilter] = useState('');
  const [studentEmails, setStudentEmails] = useState([]); // State to store unique student emails

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

  // Fetch events and staff from the server when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/events?userEmail=${userEmail}`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);

        // Extract unique student emails for staff view filtering
        const emails = Array.from(new Set(data.map(event => event.email)));
        setStudentEmails(emails);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchStaffMembers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/staff'); // Adjust the URL to fetch staff members
        if (!response.ok) {
          throw new Error('Failed to fetch staff members');
        }
        const data = await response.json();
        setStaffMembers(data);
      } catch (error) {
        console.error('Error fetching staff members:', error);
      }
    };

    fetchEvents();
    fetchStaffMembers();
  }, [userEmail]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
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
      staffEmail: formData.staffEmail, // Use the selected staff member's email
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
            staffEmail: data.staffEmail, // Add staffEmail to extendedProps
            notifyTime: data.notifyTime,
            optInNotifications: data.optInNotifications,
          },
        }]);
        setFormData({
          title: '',
          date: formData.date,
          startTime: '',
          endTime: '',
          email: userEmail,
          staffEmail: '', // Reset the staff email
          notifyTime: '1 hour',
          optInNotifications: true,
        });
      })
      .catch((error) => {
        console.error('Error adding event:', error);
        alert('There was an error booking the appointment. Please try again.');
      });
  };
  

  // Filter events by selected staff and student email
  const filteredEvents = events.filter(event => {
    const matchesStaff = selectedStaff ? event.extendedProps.staffEmail === selectedStaff : true;
    const matchesStudent = studentFilter ? event.email === studentFilter : true; // Match email exactly
    return matchesStaff && matchesStudent;
  });

  return (
    <div className="calendar-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Filters positioned directly above the calendar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', width: '100%' }}>
          <div style={{ marginRight: '20px' }}>
            <label style={{ marginRight: '5px' }}>View Mode:</label>
            <select onChange={(e) => setViewMode(e.target.value)} value={viewMode}>
              <option value="student">Student View</option>
              <option value="staff">Staff View</option>
            </select>
          </div>
  
          {viewMode === 'student' && (
            <div style={{ marginRight: '20px' }}>
              <label style={{ marginRight: '5px' }}>Filter by Staff:</label>
              <select onChange={(e) => setSelectedStaff(e.target.value)} value={selectedStaff}>
                <option value="">All Staff</option>
                {staffMembers.map((staff) => (
                  <option key={staff._id} value={staff.email}>{staff.name} ({staff.email})</option>
                ))}
              </select>
            </div>
          )}
  
          {viewMode === 'staff' && (
            <div>
              <label style={{ marginRight: '5px' }}>Filter by Student Email:</label>
              <select onChange={(e) => setStudentFilter(e.target.value)} value={studentFilter}>
                <option value="">All Students</option>
                {studentEmails.map((email) => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>
          )}
        </div>
  
        {/* Calendar and booking form positioned side-by-side */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div className="calendar" style={{ flexGrow: 1 }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              events={filteredEvents}
              dateClick={(info) => setFormData({ ...formData, date: info.dateStr })}
              displayEventTime={false}
              headerToolbar={{
                left: 'today prev,next',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
            />
          </div>
  
          {viewMode === 'student' && (
            <div className="booking-form" style={{ width: '30%', marginLeft: '20px' }}>
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
                  <label>Staff Email:</label>
                  <select
                    name="staffEmail"
                    value={formData.staffEmail}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Staff</option>
                    {staffMembers.map((staff) => (
                      <option key={staff._id} value={staff.email}>{staff.name} ({staff.email})</option>
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
      </div>
    </div>
  );    
}
