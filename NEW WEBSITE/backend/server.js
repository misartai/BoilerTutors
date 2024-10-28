const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
require('dotenv').config();  // Load the .env file

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://aryanshahu13:VyQrFxeiIhkLIWFI@boilertutors.jk0hb.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Use authentication routes
app.use('/api/auth', authRoutes);  // Make sure the /me route is included here

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
