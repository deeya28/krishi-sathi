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
// This now automatically handles our register, login, and new role-protected routes!
app.use('/api/auth', require('./routes/authRoutes'));
// ---------------------------------

// --- CONNECTING OUR POST ROUTES ---
// Any request that starts with '/api/posts' will be sent to our postRoutes file.
// This handles creating posts, viewing the feed, and post management.
app.use('/api/posts', require('./routes/postRoutes'));
// -----------------------------------

// --- CONNECTING OUR COMMENT ROUTES ---
// Any request that starts with '/api/comments' will be sent to our commentRoutes file.
// This handles adding expert/community comments and fetching comments for a post.
app.use('/api/comments', require('./routes/commentRoutes'));
// --------------------------------------

// --- CONNECTING OUR LIKE ROUTES ---
// Any request that starts with '/api/likes' will be sent to our likeRoutes file.
// This handles liking/unliking posts and fetching like counts.
app.use('/api/likes', require('./routes/likeRoutes'));
// -----------------------------------

// Global Error Handler Middleware (Optional but highly recommended)
// Catches structural errors like broken JSON payloads or database connection drops
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});