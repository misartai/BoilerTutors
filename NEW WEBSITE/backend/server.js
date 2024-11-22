const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const authRoutes = require('./routes/auth'); // Assuming you have your auth routes in a separate file
const User = require('./models/User'); // Import the User model
const Event = require('./models/Event'); // Import the Event model
const Message = require('./models/Message'); //Import Message model
const postRoutes = require('./routes/postRoutes'); // Import post routes
const draftsRouter = require('./models/Draft');
const { sendNotificationEmail, sendAnnouncementEmail } = require('./routes/auth');
require('dotenv').config(); // Load environment variables from .env file
const router = express.Router();
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://aryanshahu13:VyQrFxeiIhkLIWFI@boilertutors.jk0hb.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Setup Nodemailer transporter (adjust with your email provider settings)
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use other services (e.g., Outlook, Yahoo)
  auth: {
    user: 'boilertutors420',
    pass: 'zins bweo neuh zzgz'
  }
});
const transporter1 = nodemailer.createTransport({
  service: 'gmail',  // You can use other services (e.g., Outlook, Yahoo)
  auth: {
    user: 'boilertutors420',
    pass: 'zins bweo neuh zzgz'
  }
});

// Use authentication routes
app.use('/api/auth', authRoutes);  // Ensure your auth routes are set up
app.use('/api/postRoutes', postRoutes); // Use post routes

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

app.patch('/api/events/cancel', async (req, res) => {
  const { eventId, cancellationReason, userEmail } = req.body;

  console.log('Received eventId:', eventId);
  console.log('Received cancellation reason:', cancellationReason);

  try {
    // Ensure the eventId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Find the event by its ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Ensure the user is authorized to cancel the event
    if (event.email !== userEmail && event.tutorName !== userEmail) {
      return res.status(403).json({ message: 'You are not authorized to cancel this event' });
    }

    // Mark the event as cancelled
    event.isCancelled = true;
    event.cancellationReason = cancellationReason;
    await event.save();

    // Send cancellation email to the student
    const student = await User.findOne({ email: event.email });
    if (student) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: student.email,
        subject: `Your Appointment with ${event.tutorName} has been Cancelled`,
        text: `
          Dear ${student.name},\n\n
          We regret to inform you that your appointment with ${event.tutorName} scheduled for ${event.start} has been cancelled.\n\n
          Cancellation Reason: ${event.cancellationReason}\n\n
          If you have any questions or need to reschedule, please contact your tutor directly.\n\n
          Thank you for understanding.\n\n
          Best regards,\n
          BoilerTutors
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending cancellation email:', err);
        } else {
          console.log('Cancellation email sent:', info.response);
        }
      });
    }

    res.status(200).json({ message: 'Event cancelled successfully', event });
  } catch (error) {
    console.error('Error cancelling event:', error);
    res.status(500).json({ error: 'Error cancelling event' });
  }
});



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


/*app.post('/students/:studentName/payments', async (req, res) => {
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
});*/
app.post('/students/:studentName/payments', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const studentName = req.params.studentName;

    // Find or create the payment record for the student
    let paymentRecord = await Payment.findOne({ studentName });

    if (!paymentRecord) {
      paymentRecord = new Payment({ studentName, payments: [] });
    }

    // Prepare new payment entry
    const timestamp = new Date().toISOString(); // ISO format timestamp
    console.log('Saving payment with timestamp:', timestamp);
    const newEntry = { status, timestamp, reason };

    paymentRecord.payments.push(newEntry);
    await paymentRecord.save();

    // Prepare email details
    const emailRecipient = await User.findOne({ name: studentName }); // Adjust as needed for your schema
    if (!emailRecipient || !emailRecipient.email) {
      console.warn('No email address found for student:', studentName);
    } else {
      const mailOptions = {
        from: 'boilertutors420@gmail.com',
        to: emailRecipient.email, // The student's email address
        subject: `Payment Status Updated: ${status}`,
        text: `Hello ${studentName},\n\nYour payment status has been updated to "${status}".\n\nReason: ${reason}\n\nTimestamp: ${timestamp}\n\nBest regards,\nBoilerTutors`,
      };

      // Send the email
      transporter1.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent successfully:', info.response);
        }
      });
    }

    // Respond with updated payment record
    res.json({ message: 'Payment status updated and email sent', paymentRecord });
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



// Route to submit a report (with emails)
app.post('/reports', async (req, res) => {
  try {
    const { studentName, reason } = req.body;
    const trackingId = Math.floor(10000 + Math.random() * 90000).toString(); // Inline tracking ID generation
    const timestamp = new Date().toISOString();

    // Check if a report already exists for this student
    let report = await Report.findOne({ studentName });

    // Check if the student exists
    const student = await User.findOne({ name: studentName });
    if (!student || !student.email) {
      return res.status(404).send('Student email not found');
    }

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

    // Send an email notification to the student
    const mailOptions = {
      from: process.env.EMAIL, // Your email
      to: student.email, // Student's email
      subject: `Report Raised: ${studentName}`,
      text: `
        A new report has been raised against your account:
        - Reason: ${reason}
        - Tracking ID: ${trackingId}
        - Timestamp: ${timestamp}
        - Further Actions: Please contact an admin for further steps
      `,
    };

    console.log('email', student.email);
    await transporter1.sendMail(mailOptions);

    // Send only one response after everything is done
    res.status(200).json({
      message: 'Report submitted successfully and email sent',
      trackingId
    });
  } catch (err) {
    console.error('Report submission error:', err);
    res.status(500).send('Failed to submit report');
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
    // Fetch events where 'isCancelled' is either false or undefined
    const events = await Event.find({
      $or: [
        { isCancelled: { $ne: true } },  // Where isCancelled is not true
        { isCancelled: { $exists: false } }  // Or where isCancelled doesn't exist
      ]
    });

    res.json(events);  // Send the events as a response
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
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // Define as Date type
  isRead: { type: Boolean, default: false },
  isAnnouncement: { type: Boolean, default: false },
});

const announcementSchema = new mongoose.Schema({
  senderEmail: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

//Send Message or Announcement
app.post('/api/messages', async (req, res) => {
  try {
    const { senderEmail, receiverEmail, content } = req.body;

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver) {
      return res.status(400).json({ error: 'Invalid sender or receiver email' });
    }

    const newMessage = new Message({
      senderId: sender._id,
      receiverId: receiver._id,
      content,
      createdAt: new Date().toISOString(),
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ error: 'Failed to send message' });
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

// Backend: Mark all messages as read for a specific contact
app.put('/api/messages/markAllRead', async (req, res) => {
  const { userEmail, contactEmail } = req.body;

  try {
    const result = await Message.updateMany(
      {
        isRead: false,
        $or: [
          { senderEmail: contactEmail, recipientEmail: userEmail },
          { senderEmail: userEmail, recipientEmail: contactEmail },
        ],
      },
      { $set: { isRead: true } }
    );

    const updatedMessages = await Message.find({
      senderEmail: { $in: [userEmail, contactEmail] },
      recipientEmail: { $in: [userEmail, contactEmail] },
    });

    res.json(updatedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to mark messages as read');
  }
});


// Start the server
const port = process.env.PORT || 5000; // Use the port from environment variables or default to 5000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});