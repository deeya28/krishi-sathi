const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to generate our "VIP Wristband" (JWT)
// We pass in the user's database ID, so the token remembers who they are.
const generateToken = (id) => {
    // jwt.sign( payload, secret_key, options )
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // The wristband is valid for 30 days
    });
};

// ==========================================
// REGISTER A NEW USER
// ==========================================
const registerUser = async (req, res) => {
    try {
        // req.body contains the JSON data the frontend sent us
        const { name, email, password } = req.body;

        // 1. Validation: Did they provide everything?
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // 2. Does the user already exist?
        // We ask MongoDB to find one user where the email matches.
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash the Password!
        // We generate a "salt" with 10 rounds (a good balance of security and speed)
        const salt = await bcrypt.genSalt(10);
        // We blend the salt and the plain text password together
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the User in MongoDB
        const user = await User.create({
            name,
            email,
            password: hashedPassword, // WE STORE THE HASH, NEVER THE PLAIN TEXT
        });

        // 5. Send a success response back to the frontend
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id), // We give them their wristband immediately!
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
        // bcrypt.compare takes the plain text password from req.body and compares it to the hashed password in the database.
        if (user && (await bcrypt.compare(password, user.password))) {
            // Success! They are who they say they are. Give them a wristband.
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            // Either the email wasn't found, or the password was wrong. 
            // We use a generic message so hackers don't know which one they got wrong.
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