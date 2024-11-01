const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  email: { type: String, required: true },
  staffEmail: { type: String, required: true },
  notifyTime: { type: String },
  optInNotifications: { type: Boolean },
  eventType: { type: String, required: true }, // Ensure this line is included
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
