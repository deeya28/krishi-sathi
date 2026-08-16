const express = require("express");
const router = express.Router();

const { getUserProfile, getUserPosts } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/users/:id
// @desc    Get a user's public profile info
router.get("/:id", protect, getUserProfile);

// @route   GET /api/users/:id/posts
// @desc    Get all posts by that user
router.get("/:id/posts", protect, getUserPosts);

module.exports = router;