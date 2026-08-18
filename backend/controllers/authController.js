// Destructure both the User model and the Roles enum from your model file
const { User, Roles } = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Helper function to generate our "VIP Wristband" (JWT)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// ==========================================
// REGISTER A NEW USER
// ==========================================
const registerUser = async (req, res) => {
    try {
        // Extract the role from the request body alongside name, email, and password
        const { name, email, password, role } = req.body;

        // 1. Validation: Did they provide everything?
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // 2. Validate the role if one was provided
        if (role && !Object.values(Roles).includes(role)) {
            return res.status(400).json({ 
                message: `Invalid role. Allowed roles are: ${Object.values(Roles).join(', ')}` 
            });
        }

        // 3. Does the user already exist?
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 4. Hash the Password!
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create the User in MongoDB
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || Roles.COMMUNITY, // Uses the provided role, or defaults to community_user
        });

        // 6. Send a success response back to the frontend
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location || '',
                bio: user.bio || '',
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data received' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================
// LOGIN AN EXISTING USER
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by their email
        const user = await User.findOne({ email });

        // 2. Check if the user exists, AND if the passwords match.
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                location: user.location || '',
                bio: user.bio || '',
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================
// UPDATE USER PROFILE
// ==========================================
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, role, location, bio } = req.body;

        if (name !== undefined) user.name = name;
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;
        if (role !== undefined && Object.values(Roles).includes(role)) {
            user.role = role;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            location: updatedUser.location || '',
            bio: updatedUser.bio || '',
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile', error: error.message });
    }
};

// ==========================================
// FORGOT PASSWORD - sends a reset link via email
// ==========================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please provide your email' });
        }

        const user = await User.findOne({ email });

        // Always respond the same way whether the user exists or not -
        // this stops attackers from using this endpoint to check which
        // emails are registered.
        if (!user) {
            return res.status(200).json({
                message: 'If an account with that email exists, a reset link has been sent.',
            });
        }

        // Generate a random token, store only its hash in the DB (so a DB
        // leak alone can't be used to reset passwords), expires in 1 hour
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Reset Your Krishi Sathi Password',
                html: `
                    <p>Hi ${user.name},</p>
                    <p>You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                `,
            });
        } catch (emailError) {
            // Roll back the token if the email genuinely failed to send,
            // so the user isn't left with a dangling valid token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Could not send reset email. Please try again later.' });
        }

        res.status(200).json({
            message: 'If an account with that email exists, a reset link has been sent.',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================
// RESET PASSWORD - using the token from the emailed link
// ==========================================
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'This reset link is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================
// CHANGE PASSWORD - for a logged-in user who knows their current password
// ==========================================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide your current and new password' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    changePassword,
};