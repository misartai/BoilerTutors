const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  email: { type: String, required: true },
  tutorName: { type: String, required: true },
  notifyTime: { type: Number, default: 60 },
  optInNotifications: { type: Boolean, default: false },
  eventType: { type: String, enum: ['pso', 'office hours', 'appointment'], default: 'appointment' },
  isCancelled: { type: Boolean, default: false }, // New field
  cancellationReason: { type: String }, // New field
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);


module.exports = Event;
