const mongoose = require('mongoose');

// MongoDB connection using the existing URI
const uri = 'mongodb+srv://agraw185:Boiler%402024@cluster0.v6qhp.mongodb.net/discussionBoardApp?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String
});

const User = mongoose.model('User', userSchema);

// Insert Fake Users
const fakeUsers = [
  { username: 'aryan', email: 'ashahu@purdue.edu' },
  { username: 'shivli', email: 'shivliagrawal14@gmail.com' },
  { username: 'mia', email: 'misartai@purdue.edu' }
];

User.insertMany(fakeUsers)
  .then(() => {
    console.log('Fake users added successfully');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Failed to add fake users:', err);
    mongoose.connection.close();
  });
