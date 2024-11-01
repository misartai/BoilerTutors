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

// ----- Payment Functionality -----

// Schema for payments
const paymentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  payments: [
    {
      status: { type: String, required: true },
      timestamp: { type: String, required: true },
      reason: { type: String, default: '' }, // Reason for denial if applicable
      amount: {type: String, default: '10'},
    },
  ],
});

const Payment = mongoose.model('Payment', paymentSchema);

// Route to fetch all students (if not already created)
app.get('/students', async (req, res) => {
  // Replace with actual student fetching logic
  const students = await User.find({ accountType: 'student' });
  res.json(students);
});

app.post('/send-email', async (req, res) => {
  const { subject, message, studentName } = req.body;

  const mailOptions = {
      from: process.env.EMAIL,
      to: studentName, // Assuming you have the student's email in the database
      subject: subject,
      text: message,
  };

  try {
      await transporter.sendMail(mailOptions);
      res.json({ message: 'Email sent successfully' });
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Error sending email' });
  }
});


app.post('/students/:studentName/payments', async (req, res) => {
  try {
      const { status, reason } = req.body;
      const studentName = req.params.studentName;

      let paymentRecord = await Payment.findOne({ studentName });

      if (!paymentRecord) {
          paymentRecord = new Payment({ studentName, payments: [] });
      }

      // Prepare new payment entry
      const timestamp = new Date().toISOString(); // Make sure the timestamp is in ISO format
      console.log('Saving payment with timestamp:', timestamp); // Log the timestamp
      const newEntry = { status, timestamp, reason };
      paymentRecord.payments.push(newEntry);
      await paymentRecord.save();

      res.json({ message: 'Payment status updated', paymentRecord });
  } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).send('Error updating payment status');
  }
});


// Confirm payment route
app.post('/students/:studentId/payments', async (req, res) => {
  const { studentId } = req.params;
  const { status, timestamp, reason } = req.body;

  try {
    const paymentEntry = await Payment.findOneAndUpdate(
      { studentId },
      { $push: { payments: { status, timestamp, reason } } },
      { new: true, upsert: true } // Create a new document if it doesn't exist
    );

    res.status(200).json(paymentEntry);
  } catch (error) {
    console.error('Error updating payment entry:', error);
    res.status(500).json({ error: 'Error updating payment entry' });
  }
});


// report
const reportSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  reports: [
    {
      trackingId: { type: String, required: true, unique: true },
      timestamp: { type: String, required: true },
      reason: { type: String, default: '' },
    }
  ]
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;

app.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find({});
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error });
  }
});



app.post('/reports', async (req, res) => {
  try {
      const { studentName, reason } = req.body;
      const trackingId = Math.floor(10000 + Math.random() * 90000).toString(); // Inline generation
      const timestamp = new Date().toISOString();

      // Check if a report already exists for this student
      let report = await Report.findOne({ studentName });

      if (report) {
          // If the report exists, push the new report entry into the reports array
          report.reports.push({
              trackingId,
              timestamp,
              reason
          });
          await report.save();
      } else {
          // If no report exists, create a new report entry
          report = new Report({
              studentName,
              reports: [{
                  trackingId,
                  timestamp,
                  reason
              }]
          });
          await report.save();
      }

      res.status(201).json({ message: 'Report saved successfully!', trackingId });
  } catch (error) {
      console.error('Error saving report:', error);
      res.status(400).json({ message: 'Error saving report', error });
  }
});




app.get('/reports/:studentName', async (req, res) => {
  try {
    const { studentName } = req.params;
    const reports = await Report.findOne({ studentName });

    if (!reports) {
      return res.status(404).json({ message: 'No reports found for this student.' });
    }

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error });
  }
});


//const Payment = require('./models/Payment'); // Adjust the model path accordingly

app.get('/api/payments', async (req, res) => {
  try {
      const payments = await Payment.find({});
      const formattedPayments = payments.map(payment => ({
          ...payment._doc,
          payments: payment.payments.map(p => ({
              amount: p.amount,
              status: p.status,
              timestamp: p.timestamp, // Ensure this field is included
              reason: p.reason // Ensure this field is included
          }))
      }));
      console.log("Fetched Payments:", JSON.stringify(formattedPayments, null, 2));
      res.json(formattedPayments);
  } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Server error" });
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
app.post('/refresh-token', (req, res) => {
  const { token } = req.body;

  // Verify the token and get the payload
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send('Token is invalid or expired');
    }

    // Create a new token
    const newToken = jwt.sign({ userId: decoded.userId }, secretKey, { expiresIn: '1h' });
    res.json({ token: newToken });
  });
});

// Start the server
const port = process.env.PORT || 5000; // Use the port from environment variables or default to 5000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
