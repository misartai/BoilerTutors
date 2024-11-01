const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  email: { type: String, required: true },
  tutorName: { type: String },
  notifyTime: { type: String },
  optInNotifications: { type: Boolean, default: false },
  eventType: { type: String, enum: ['appointment', 'pso', 'office'], default: 'appointment' }, // New field for event type
});

module.exports = mongoose.model('Event', eventSchema);

