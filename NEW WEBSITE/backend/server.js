const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const authRoutes = require('./routes/auth'); // Assuming you have your auth routes in a separate file
const User = require('./models/User'); // Import the User model
const Event = require('./models/Event'); // Import the Event model
const Message = require('./models/Message'); // Import Message model
const draftsRouter = require('./models/Draft');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://aryanshahu13:VyQrFxeiIhkLIWFI@boilertutors.jk0hb.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Setup Nodemailer transporter (adjust with your email provider settings)
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services (e.g., Outlook, Yahoo)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD // Use environment variables for sensitive data
  }
});

// Use authentication routes
app.use('/api/auth', authRoutes);  // Ensure your auth routes are set up

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/public'))); // get index page

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
  averageRating: { type: Number, default: 0 }, // Add averageRating field
});

// Helper function to calculate average rating
tutorSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) return 0;
  const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return totalRating / this.reviews.length;
};

// Pre-save hook to update average rating
tutorSchema.pre('save', function (next) {
  this.averageRating = this.calculateAverageRating();
  next();
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

// Route to get all events from the database, with optional filtering by eventType
app.get('/api/events', async (req, res) => {
  const { eventType, tutorEmail, studentEmail, eventName } = req.query;

  // Build filter object based on provided query parameters
  const filter = {};
  if (eventType) filter.eventType = eventType;
  if (tutorEmail) filter.tutorName = tutorEmail;
  if (studentEmail) filter.email = studentEmail;
  if (eventName) filter.title = eventName;

  try {
    const events = await Event.find(filter);
    res.json(events);
  } catch (err) {
    console.error('Error retrieving events:', err);
    res.status(500).send('Error retrieving events');
  }
});

// Route to add a new event
app.post('/api/events', async (req, res) => {
  const { title, start, end, email, staffEmail, notifyTime, optInNotifications, eventType } = req.body;

  console.log('Incoming event data:', req.body);

  // Perform simple validation on incoming data
  if (!title || !start || !end || !email || !staffEmail || !eventType) {
    return res.status(400).send('All fields are required.');
  }

  const newEvent = new Event({
    title,
    start,
    end,
    email,
    staffEmail, // Change from tutorName to staffEmail
    notifyTime,
    optInNotifications,
    eventType, // Ensure eventType is included when creating the new Event
  });

  try {
    const savedEvent = await newEvent.save();
    console.log('New event saved:', savedEvent);

    // Only send emails if the user opted into notifications
    if (optInNotifications) {
      // Send confirmation email to the student
      const confirmationMailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Appointment Confirmation',
        text: `Dear student,\n\nYour appointment with ${staffEmail} is confirmed.\n\nDetails:\n- Date: ${start}\n- Staff: ${staffEmail}\n- Duration: ${start} to ${end}\n\nThank you!`
      };

      transporter.sendMail(confirmationMailOptions, (err, info) => {
        if (err) {
          console.error('Error sending confirmation email:', err);
        } else {
          console.log('Confirmation email sent:', info.response);
        }
      });

      // Send email to the staff member
      const appointmentLink = `http://localhost:3000/accept-appointment/${savedEvent._id}`; // Link to accept appointment
      const appointmentEmailOptions = {
        from: process.env.EMAIL,
        to: staffEmail,
        subject: 'New Appointment Scheduled',
        text: `Dear Staff,\n\nYou have a new appointment scheduled.\n\nDetails:\n- Title: ${title}\n- Date: ${start}\n- Duration: ${start} to ${end}\n\nPlease click the link to accept the appointment:\n${appointmentLink}\n\nThank you!`
      };

      transporter.sendMail(appointmentEmailOptions, (err, info) => {
        if (err) {
          console.error('Error sending appointment email:', err);
        } else {
          console.log('Appointment email sent:', info.response);
        }
      });
    }

    res.status(201).json(savedEvent); // Send back the saved event
  } catch (err) {
    console.error('Failed to create event:', err); // Log error details
    res.status(500).send('Failed to create event');
  }
});

// Route to accept the appointment
app.get('/api/accept-appointment/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Logic to mark the event as accepted (you could add a field for this in the schema)
    // For example, you might add a field called "accepted" to the event and update it here
    event.accepted = true; // Example field to indicate acceptance
    await event.save();

    res.send('Appointment accepted successfully.');
  } catch (error) {
    console.error('Error accepting appointment:', error);
    res.status(500).send('Error accepting appointment');
  }
});

// Start the server
const port = process.env.PORT || 5000; // Use the port from environment variables or default to 5000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
