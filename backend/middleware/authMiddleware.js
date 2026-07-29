const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');

// 1. Verify if the user is logged in (has a valid token)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token payload and attach it to the req object
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// 2. Restrict access to specific roles only
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure req.user exists and their role matches one of the allowed roles
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Forbidden: You do not have permission to access this resource' 
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
