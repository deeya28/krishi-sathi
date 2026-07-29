const express = require("express");
const router = express.Router();

const { toggleLike, getLikesByPost } = require("../controllers/likeController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/likes/:postId
// @desc    Like a post, or unlike it if already liked (toggle)
router.post("/:postId", protect, toggleLike);

// @route   GET /api/likes/:postId
// @desc    Get like count + whether current user liked it
router.get("/:postId", protect, getLikesByPost);

module.exports = router;