const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/calendarDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Define Event schema and model
const eventSchema = new mongoose.Schema({
  title: String,
  start: String,
  end: String,
  email: String,
  tutorName: String,
  notifyTime: String, // Store custom reminder time
  optInNotifications: Boolean // Track user preference for notifications
});

const Event = mongoose.model('Event', eventSchema);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'boilertutors420@gmail.com', // Use environment variable for email
    pass: 'zins bweo neuh zzgz', // Use environment variable for App Password
  },
});

// Route to get all events from the database
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events from MongoDB
    res.json(events); // Send the events as a response
  } catch (err) {
    console.error('Error retrieving events:', err);
    res.status(500).send('Error retrieving events');
  }
});

// Route to add a new event
app.post('/events', async (req, res) => {
  const { title, start, end, email, tutorName, notifyTime, optInNotifications } = req.body;

  // Log the incoming request data for debugging
  console.log('Incoming event data:', req.body);

  // Perform simple validation on incoming data
  if (!title || !start || !end || !email || !tutorName) {
    return res.status(400).send('All fields are required.');
  }

  const newEvent = new Event({ title, start, end, email, tutorName, notifyTime, optInNotifications });

  try {
    const savedEvent = await newEvent.save(); // Save the event to the database
    console.log('New event saved:', savedEvent);

    // Only send emails if the user opted into notifications
    if (optInNotifications) {
      // Send confirmation email with tutor's name
      const confirmationMailOptions = {
        from: 'boilertutors420@gmail.com',
        to: email,
        subject: 'Appointment Confirmation',
        text: `Dear student,\n\nYour appointment with ${tutorName} is confirmed.\n\nDetails:\n- Date: ${start}\n- Tutor: ${tutorName}\n- Duration: ${start} to ${end}\n\nThank you!`
      };

      transporter.sendMail(confirmationMailOptions, (err, info) => {
        if (err) {
          console.error('Error sending confirmation email:', err);
        } else {
          console.log('Confirmation email sent:', info.response);
        }
      });

      // Schedule a reminder email with tutor's name
      const reminderTime = calculateReminderTime(start, notifyTime);
      const currentTime = new Date();

      if (reminderTime > currentTime) {
        const delay = reminderTime - currentTime;

        setTimeout(() => {
          const reminderMailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Appointment Reminder',
            text: `Dear student,\n\nThis is a reminder for your upcoming appointment with ${tutorName}.\n\nDetails:\n- Date: ${start}\n- Tutor: ${tutorName}\n- Duration: ${start} to ${end}\n\nPlease make sure to be available on time!`
          };

          transporter.sendMail(reminderMailOptions, (err, info) => {
            if (err) {
              console.error('Error sending reminder email:', err);
            } else {
              console.log('Reminder email sent:', info.response);
            }
          });
        }, delay);
      }
    }

    res.status(201).json(savedEvent); // Send back the saved event
  } catch (err) {
    console.error('Failed to create event:', err); // Log error details
    res.status(500).send('Failed to create event');
  }
});


// Function to calculate reminder time based on user's preference
function calculateReminderTime(appointmentTime, notifyTime) {
  const appointmentDate = new Date(appointmentTime);
  switch (notifyTime) {
    case '30 minutes':
      return new Date(appointmentDate.getTime() - 30 * 60 * 1000); // 30 minutes before
    case '15 minutes':
      return new Date(appointmentDate.getTime() - 15 * 60 * 1000); // 15 minutes before
    default:
      return new Date(appointmentDate.getTime() - 60 * 60 * 1000); // 1 hour before (default)
  }
}

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
