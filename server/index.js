const express = require('express'); // core web server
const cors = require('cors');       // Allows React frontend to talk to backend (Cross origin resource sharing)
require('dotenv').config();         // load .env variables
const db = require('./db/connection'); // import db connection
const authRoutes = require('./routes/auth'); // routes/auth.js -> contains user registration logic
const app = express();  // create express ap p

// Middleware
app.use(cors());        // enable cors
app.use(express.json());    // parse json bodies from post request

// Root route for testing
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// for all routes
app.use('/api', authRoutes);

// Start server
const PORT = process.env.PORT || 5000; // if process.env.PORT is not set (undefined) then use 5000 as a default
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});