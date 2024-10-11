const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/usersDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// User schema and model with unique email
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Serve the main HTML page with embedded JavaScript and linked CSS
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Signup</title>
      <link rel="stylesheet" type="text/css" href="/styles.css">
    </head>
    <body>
      <h1>Create an Account</h1>
      <div id="form-container"></div>
      <script src="/signup.js"></script>
    </body>
    </html>
  `);
});

// Handle signup route (POST request) with email validation and duplicate email check
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Backend validation for email ending with @purdue.edu
  if (!email.endsWith('@purdue.edu')) {
    return res.status(400).send('Invalid email. Email must end with "@purdue.edu".');
  }

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send('Email already registered. Please use a different email.');
    }

    // If email is not already taken, create a new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Send back the user's name in JSON format
    res.status(201).json({ name });
  } catch (err) {
    // Handle duplicate key error (MongoDB error code 11000)
    if (err.code === 11000) {
      return res.status(400).send('Email already registered. Please use a different email.');
    } else {
      return res.status(500).send('Failed to create user');
    }
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
