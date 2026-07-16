const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // This allows us to read req.body as JSON!
app.use(express.urlencoded({ extended: false })); // This allows us to read form data

// --- CONNECTING OUR NEW ROUTES ---
// Any request that starts with '/api/auth' will be sent to our authRoutes file.
app.use('/api/auth', require('./routes/authRoutes'));
// ---------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});