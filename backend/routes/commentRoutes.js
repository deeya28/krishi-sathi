const express = require("express");
const router = express.Router();

const {
  addComment,
  getCommentsByPost,
  deleteComment,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// @route   POST /api/comments/:postId
// @desc    Expert, community user, or farmer adds a comment on a post
router.post(
  "/:postId",
  protect,
  authorize("agricultural_expert", "community_user", "farmer"),
  addComment
);

// @route   GET /api/comments/:postId
// @desc    Get all comments for a post - optional filter ?type=expert|community
router.get("/:postId", protect, getCommentsByPost);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment (by the user who created it, or an admin for moderation)
router.delete("/:id", protect, deleteComment);

module.exports = router;