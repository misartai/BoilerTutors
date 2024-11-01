const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const authRoutes = require('./routes/auth'); // Assuming you have your auth routes in a separate file
const User = require('./models/User'); // Import the User model
const Event = require('./models/Event'); // Import the Event model
const Message = require('./models/Message'); //Import Message model
const draftsRouter = require('./routes/drafts');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://aryanshahu13:VyQrFxeiIhkLIWFI@boilertutors.jk0hb.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Use environment variable for email
    pass: process.env.EMAIL_PASSWORD, // Use environment variable for App Password
  },
});

// Use authentication routes
app.use('/api/auth', authRoutes);  // Ensure your auth routes are set up

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/public'))); //get index page

// ----- Tutor & Review Functionality -----

// Schema for reviews (used for RateTutor functionality)
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  content: { type: String, required: true },
});

// Schema for tutors (used for RateTutor functionality)
const tutorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  reviews: [reviewSchema],
});

// Virtual property to calculate average rating
tutorSchema.virtual('averageRating').get(function () {
  if (this.reviews.length === 0) return 0;
  const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (totalRating / this.reviews.length).toFixed(2);
});

tutorSchema.set('toJSON', { virtuals: true });

// Tutor model
const Tutor = mongoose.model('Tutor', tutorSchema);

// Fetch all users who are tutors (for dropdown)
app.get('/api/tutors', async (req, res) => {
  try {
    // Fetch all users where isTutor is true
    const tutors = await User.find({ isTutor: true }, 'name email'); // Retrieve only name and email fields
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tutors' });
  }
});

// Fetch reviews for a specific tutor
app.get('/api/tutors/:tutorId/reviews', async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.tutorId);
    res.json(tutor.reviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Fetch a specific tutor for average rating
app.get('/api/tutors/:tutorId', async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.tutorId);
    res.json(tutor);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tutor' });
  }
});

// Add a new review for a specific tutor
app.post('/api/tutors/:tutorId/reviews', async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.tutorId);
    const newReview = {
      rating: req.body.rating,
      content: req.body.content
    };
    tutor.reviews.push(newReview);
    await tutor.save();
    res.json(newReview);
  } catch (error) {
    res.status(500).json({ error: 'Error adding review' });
  }
});

// ----- Event Functionality -----

// Function to calculate the reminder time based on user's preference
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

// Route to get all events from the database
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events from MongoDB
    res.json(events); // Send the events as a response
  } catch (err) {
    console.error('Error retrieving events:', err);
    res.status(500).send('Error retrieving events');
  }
});

// Route to add a new event
app.post('/api/events', async (req, res) => {
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
        from: process.env.EMAIL,
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

      // Schedule a reminder email
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

// Start the server
const port = process.env.PORT || 5000; // Use the port from environment variables or default to 5000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
