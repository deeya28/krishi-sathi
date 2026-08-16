const express = require("express");
const router = express.Router();

const { toggleFollow, getFollowInfo } = require("../controllers/followController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/follows/:userId
// @desc    Follow or unfollow a user (toggle)
router.post("/:userId", protect, toggleFollow);

// @route   GET /api/follows/:userId
// @desc    Get follower/following counts + whether I follow this user
router.get("/:userId", protect, getFollowInfo);

module.exports = router;