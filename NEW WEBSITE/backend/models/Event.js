const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  email: { type: String, required: true },
  tutorName: { type: String, required: true },
  notifyTime: { type: String, default: '1 hour' },
  optInNotifications: { type: Boolean, default: false },
  eventType: { type: String, enum: ['PSO', 'Office Hours', 'Appointment'], default: 'Appointment' }, 
});

const Event = mongoose.model('Event', eventSchema);


module.exports = Event;
