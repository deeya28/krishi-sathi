const express = require('express');
const router = express.Router();
// Import the brains we just wrote
const { registerUser, loginUser } = require('../controllers/authController');

// When a POST request hits /register, run the registerUser function
router.post('/register', registerUser);

// When a POST request hits /login, run the loginUser function
router.post('/login', loginUser);

module.exports = router;