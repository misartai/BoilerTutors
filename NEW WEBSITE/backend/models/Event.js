// Event.js
const mongoose = require('mongoose');

// Define Event schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  tutorName: {
    type: String,
    required: true,
  },
  notifyTime: {
    type: String, // Custom reminder time
    enum: ['30 minutes', '15 minutes', '1 hour'], // Specify possible values if needed
  },
  optInNotifications: {
    type: Boolean,
    default: false, // Default to false if not specified
  },
});

// Export the Event model
module.exports = mongoose.model('Event', eventSchema);
