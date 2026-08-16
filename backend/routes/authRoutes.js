const express = require('express');
const router = express.Router();

// Import controllers
const {
    registerUser,
    loginUser,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    changePassword,
} = require('../controllers/authController');

// Import authentication middleware and Roles enum
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { Roles } = require('../models/userModel');

// ==========================================
// PUBLIC & PROTECTED AUTH ROUTES
// ==========================================
// Anyone can hit these endpoints to register or log in
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);

// ==========================================
// PASSWORD RESET / CHANGE ROUTES
// ==========================================
// Logged-out user requests a reset link via email
router.post('/forgot-password', forgotPassword);
// Logged-out user submits a new password using the token from that email
router.put('/reset-password/:token', resetPassword);
// Logged-in user changes their password, knowing the current one
router.put('/change-password', protect, changePassword);

// ==========================================
// PROTECTED ROLE-SPECIFIC ROUTES (Examples)
// ==========================================

// Example 1: Admin Dashboard (Only 'admin' can access)
router.get(
    '/admin-dashboard', 
    protect, 
    authorizeRoles(Roles.ADMIN), 
    (req, res) => {
        res.json({ message: `Welcome Admin ${req.user.name}!` });
    }
);

// Example 2: Expert Forum (Only 'agricultural_expert' and 'admin' can access)
router.post(
    '/expert-advice', 
    protect, 
    authorizeRoles(Roles.EXPERT, Roles.ADMIN), 
    (req, res) => {
        res.json({ message: 'Expert advice portal route active' });
    }
);

// Example 3: Farmer Tools (Only 'farmer' can access)
router.get(
    '/farmer-tools', 
    protect, 
    authorizeRoles(Roles.FARMER), 
    (req, res) => {
        res.json({ message: 'Marketplace pricing tools loaded' });
    }
);

module.exports = router;