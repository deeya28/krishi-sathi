const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./Config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
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

// --- CONNECTING OUR FOLLOW ROUTES ---
// Any request that starts with '/api/follows' will be sent to our followRoutes
// file. This handles following/unfollowing users and fetching follow counts.
app.use('/api/follows', require('./routes/followRoutes'));
// -------------------------------------

// --- CONNECTING OUR SHARE ROUTES ---
// Any request that starts with '/api/shares' will be sent to our shareRoutes
// file. This handles recording post shares and fetching share counts.
app.use('/api/shares', require('./routes/shareRoutes'));
// ------------------------------------

// --- CONNECTING OUR APPOINTMENT ROUTES ---
// Any request that starts with '/api/appointments' will be sent to our
// appointmentRoutes file. This handles viewing experts, booking appointments,
// and eSewa payment verification.
app.use('/api/appointments', require('./routes/appointmentRoutes'));
// -----------------------------------------

// --- CONNECTING OUR NOTIFICATION ROUTES ---
// Any request that starts with '/api/notifications' will be sent to our
// notificationRoutes file. This handles fetching, marking read, and clearing
// notifications triggered by likes, comments, and appointment confirmations.
app.use('/api/notifications', require('./routes/notificationRoutes'));
// -------------------------------------------

// --- CONNECTING OUR SEARCH ROUTES ---
// Any request that starts with '/api/search' will be sent to our searchRoutes
// file. This handles searching users and posts by keyword.
app.use('/api/search', require('./routes/searchRoutes'));
// -------------------------------------

// --- CONNECTING OUR USER ROUTES ---
// Any request that starts with '/api/users' will be sent to our userRoutes file.
// This handles fetching a user's public profile and their posts (for the
// "view other user's profile" feature).
app.use('/api/users', require('./routes/userRoutes'));
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