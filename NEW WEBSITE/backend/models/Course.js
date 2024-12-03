const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseDescription: { type: String, required: true },
  announcements: { type: [String], default: [] },
  professors: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: true },
  students: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  tutors: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
});

module.exports = mongoose.model('Course', courseSchema);
