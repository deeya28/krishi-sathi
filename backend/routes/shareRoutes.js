const express = require("express");
const router = express.Router();

const { createShare, getShareCount } = require("../controllers/shareController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/shares/:postId
// @desc    Record that the current user shared this post
router.post("/:postId", protect, createShare);

// @route   GET /api/shares/:postId
// @desc    Get the share count for a post
router.get("/:postId", protect, getShareCount);

module.exports = router;