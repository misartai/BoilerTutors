const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const authRoutes = require('./routes/auth'); // Assuming you have your auth routes in a separate file
const User = require('./models/User'); // Import the User model
const Event = require('./models/Event'); // Import the Event model
const Message = require('./models/Message'); //Import Message model
const draftsRouter = require('./models/Draft');
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
app.get('/tutors/:tutorId/reviews', async (req, res) => {
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
      content: req.body.content,
    };
    tutor.reviews.push(newReview);
    
    // Update the average rating before saving
    tutor.averageRating = tutor.calculateAverageRating();
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
      const { status, timestamp, reason } = req.body;
      const studentName = req.params.studentName;

      let paymentRecord = await Payment.findOne({ studentName });

      if (!paymentRecord) {
          paymentRecord = new Payment({ studentName, payments: [] });
      }

      // Prepare new payment entry
      const newEntry = { status, timestamp, reason };
      paymentRecord.payments.push(newEntry);
      await paymentRecord.save();

      // Send email notification if payment status is updated
      const subject = `Payment Status Updated: ${status}`;
      const message = `The payment status for ${studentName} has been updated to ${status} on ${timestamp}. Reason: ${reason || 'N/A'}.`;
      await sendEmail(subject, message); // Assuming sendEmail function is defined above

      res.json({ message: 'Payment status updated', paymentRecord });
  } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).send('Error updating payment status');
  }
});


const reportSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  reports: [
    {
      trackingId: { type: String, required: true },
      details: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ]
});

const Report = mongoose.model('Report', reportSchema);
app.post('/api/reports', async (req, res) => {
  const { studentId, details } = req.body;
  const trackingId = uuidv4();

  try {
    // Find or create a report entry for the student
    let reportEntry = await Report.findOne({ studentId });
    if (!reportEntry) {
      reportEntry = new Report({ studentId, reports: [] });
    }

    // Add the new report to the reports array
    reportEntry.reports.push({ trackingId, details });

    // Save the updated report entry
    await reportEntry.save();

    res.status(201).json({ trackingId, details });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

app.get('/api/reports/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const reportEntry = await Report.findOne({ studentId });
    if (!reportEntry) {
      return res.status(404).json({ error: 'No reports found for this student' });
    }

    res.json(reportEntry.reports); // Return the reports array for the student
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Error fetching reports' });
  }
});

app.get('/api/reports/details/:trackingId', async (req, res) => {
  const { trackingId } = req.params;

  try {
    const reportEntry = await Report.findOne({ 'reports.trackingId': trackingId });

    if (!reportEntry) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = reportEntry.reports.find(report => report.trackingId === trackingId);
    res.json(report);
  } catch (error) {
    console.error('Error fetching report details:', error);
    res.status(500).json({ error: 'Error fetching report details' });
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

//--Messaging Functions--

//Required schemas
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isAnnouncement: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


const announcementSchema = new mongoose.Schema({
  senderEmail: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

//Send Message or Announcement
app.post('/api/messages', async (req, res) => {
  const { senderEmail, recipientEmail, content, isAnnouncement = false } = req.body;

  try {
    const sender = await User.findOne({ email: senderEmail });

    if (isAnnouncement && sender.accountType !== 'professor') {
      return res.status(403).json({ error: 'Only professors can send announcements.' });
    }

    // Prepare the message object
    const messageData = {
      senderEmail,
      recipientEmail: isAnnouncement ? null : recipientEmail, // Only set for non-announcements
      content,
      isAnnouncement,
      isRead: false,
      createdAt: new Date(),
    };

    const newMessage = new Message(messageData);
    const savedMessage = await newMessage.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});


// Fetch messages for a user
app.get('/api/messages', async (req, res) => {
  const { userEmail } = req.query;

  try {
    const messages = await Message.find({
      $or: [{ senderEmail: userEmail }, { recipientEmail: userEmail }],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Update message read status
app.patch('/api/messages/:messageId', async (req, res) => {
  const { messageId } = req.params;
  const { isRead } = req.body;
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { isRead },
      { new: true }
    );
    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// Fetch contacts
app.get('/api/users', async (req, res) => {
  try {
    const contacts = await User.find({}, 'name email accountType isTutor');
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Start the server
const port = process.env.PORT || 5000; // Use the port from environment variables or default to 5000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
