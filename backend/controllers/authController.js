// Destructure both the User model and the Roles enum from your model file
const { User, Roles } = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
                role: user.role, // Return the assigned role string to the client
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
            // Success! Send back the role string instead of the old isAdmin boolean
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, // Frontend can now read this string to handle route access
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
