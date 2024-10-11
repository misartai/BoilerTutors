const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Add nodemailer for emails

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
  email: String, // Track user's email
});

const Event = mongoose.model('Event', eventSchema);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this based on your email provider
  auth: {
    user: 'boilertutors420@gmail.com', // Replace with your Gmail
    pass: 'zins bweo neuh zzgz', // Replace with your app password or email password
  },
});

// Route to get all events
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).send('Error retrieving events');
  }
});

// Route to add a new event
app.post('/events', async (req, res) => {
  const { title, start, end, email } = req.body;

  const newEvent = new Event({ title, start, end, email });

  try {
    await newEvent.save();

    // Send confirmation email
    const mailOptions = {
      from: 'boilertutors420@gmail.com',
      to: email,
      subject: 'Appointment Confirmation',
      text: `Your appointment "${title}" has been confirmed on ${start}.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending confirmation email:', err);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
    });

    // Schedule a reminder email (example: 1 hour before the appointment)
    const reminderTime = new Date(new Date(start).getTime() - 60 * 60 * 1000); // 1 hour before
    const currentTime = new Date();

    if (reminderTime > currentTime) {
      const delay = reminderTime - currentTime;

      setTimeout(() => {
        const reminderOptions = {
          from: 'boilertutors420@gmail.com',
          to: email,
          subject: 'Appointment Reminder',
          text: `Reminder: Your appointment "${title}" is coming up at ${start}.`,
        };

        transporter.sendMail(reminderOptions, (err, info) => {
          if (err) {
            console.error('Error sending reminder email:', err);
          } else {
            console.log('Reminder email sent:', info.response);
          }
        });
      }, delay);
    }

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).send('Failed to create event');
  }
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
