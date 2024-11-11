const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['student', 'professor'],  // Only allow 'student' or 'professor'
    required: true
  },
  isTutor: {
    type: Boolean,
    default: false  // Default value for isTutor is false
  },
  validAccount: {
    type: Boolean,
    default: true  // Default to true for students, will be false for professors until admin approval
  }
});

module.exports = mongoose.model('User', userSchema);
