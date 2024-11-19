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
const router = express.Router();
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

// Setup Nodemailer transporter (adjust with your email provider settings)
const transporter1 = nodemailer.createTransport({
  service: 'gmail',  // You can use other services (e.g., Outlook, Yahoo)
  auth: {
    user: 'boilertutors420',
    pass: 'zins bweo neuh zzgz'
  }
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
    const timestamp = new Date().toISOString(); // Ensure we have an ISO formatted timestamp

    // Find the payment record for the student
    let paymentRecord = await Payment.findOne({ studentName });
    const student = await User.findOne({ name: studentName });
    if (!paymentRecord) {
      // If no payment record exists for the student, create one
      paymentRecord = new Payment({ studentName, payments: [] });
    }

    // Existing functionality: Handle confirmed or denied payment (old behavior)
    if (status === 'Confirmed' || status === 'Denied') {
      // Prepare new payment entry
      const newEntry = { status, timestamp, reason };
      paymentRecord.payments.push(newEntry);
      await paymentRecord.save();

      // Send email for confirmed or denied payment
      let emailSubject = '';
      let emailBody = '';
      if (status === 'Confirmed') {
        emailSubject = 'Payment Confirmed';
        emailBody = `Payment for ${studentName} has been confirmed on ${timestamp}.`;
      } else if (status === 'Denied') {
        emailSubject = 'Payment Denied';
        emailBody = `Payment for ${studentName} was denied on ${timestamp}. Reason: ${reason}`;
      }

      // Send the email using the transporter
      const mailOptions = {
        from: 'boilertutors420@gmail.com', // Sender address
        to: 'recipient@example.com', 
        subject: emailSubject,
        text: emailBody,  // You can also use HTML if needed (e.g., html: '<p>Your email body in HTML</p>')
      };

      try {
        await transporter1.sendMail(mailOptions);
        console.log('Email sent successfully');
      } catch (error) {
        console.error('Error sending email:', error);
      }

      // Return the response to the client
      return res.json({
        message: 'Payment status updated',
        paymentRecord,
        emailSent: true,
      });
    }

    // New functionality: Handle editing from Confirmed to Denied, or Denied to Confirmed
    if (status === 'EditFromConfirmToDeny' || status === 'EditFromDenyToConfirm') {
      // Look for the most recent payment entry
      const lastPayment = paymentRecord.payments[paymentRecord.payments.length - 1];
      
      // Update the last payment entry based on status change
      if (status === 'EditFromConfirmToDeny' && lastPayment.status === 'Confirmed') {
        lastPayment.status = 'Denied';
        lastPayment.reason = reason;
        lastPayment.timestamp = timestamp;
      } else if (status === 'EditFromDenyToConfirm' && lastPayment.status === 'Denied') {
        lastPayment.status = 'Confirmed';
        lastPayment.timestamp = timestamp;
      }

      // Save the updated payment entry
      await paymentRecord.save();

      // Send the appropriate email for status change
      let emailSubject = '';
      let emailBody = '';
      if (status === 'EditFromConfirmToDeny') {
        emailSubject = 'Payment Entry Updated (Confirmed to Denied)';
        emailBody = `The payment for ${studentName} has been updated from "Confirmed" to "Denied" on ${timestamp}. Reason: ${reason}.`;
      } else if (status === 'EditFromDenyToConfirm') {
        emailSubject = 'Payment Entry Updated (Denied to Confirmed)';
        emailBody = `The payment for ${studentName} has been updated from "Denied" to "Confirmed" on ${timestamp}.`;
      }

      // Send the email using the transporter
      const mailOptions = {
        from: 'boilertutors420@gmail.com', // Sender address
        to: 'recipient@example.com', // Replace with the recipient's email
        subject: emailSubject,
        text: emailBody,  // You can also use HTML if needed (e.g., html: '<p>Your email body in HTML</p>')
      };

      try {
        await transporter1.sendMail(mailOptions);
        console.log('Email sent successfully');
      } catch (error) {
        console.error('Error sending email:', error);
      }

      // Return the response
      return res.json({
        message: 'Payment status updated and email sent',
        paymentRecord,
        emailSent: true,
      });
    }

    // If status is invalid or no status is given, return an error
    return res.status(400).json({ message: 'Invalid payment status' });
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
// app.post without emails
/*app.post('/reports', async (req, res) => {
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
});*/

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
  senderEmail: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  content: { type: String, required: true },
  isAnnouncement: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


const announcementSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

//Send Message or Announcement
// Send Message or Announcement
app.post('/api/messages', async (req, res) => {
  const { senderEmail, recipientEmail, content, isAnnouncement = false } = req.body;

  try {
    // Fetch the user from the database
    const sender = await User.findOne({ email: senderEmail });

    // Check if the message is an announcement and the sender is a professor
    if (isAnnouncement && sender.accountType !== 'professor') {
      return res.status(403).json({ error: 'Only professors can send announcements.' });
    }

    // Prepare message object
    const messageSchema = new mongoose.Schema({
      senderEmail: { type: String, required: true },
      recipientEmail: { type: String }, // Optional for announcements
      content: { type: String, required: true },
      isAnnouncement: { type: Boolean, default: false },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    });

    module.exports = mongoose.model('Message', messageSchema);


    // If it's not an announcement, recipientEmail is required
    if (!isAnnouncement) {
      if (!recipientEmail) {
        return res.status(400).json({ error: 'Recipient email is required for regular messages.' });
      }
      messageData.recipientEmail = recipientEmail;
    }

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