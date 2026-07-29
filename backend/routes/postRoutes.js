const express = require("express");
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// TODO: adjust these to match your actual auth middleware names/exports
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// @route   POST /api/posts
// @desc    Farmer creates a new post
router.post("/", protect, authorize("farmer"), createPost);

// @route   GET /api/posts
// @desc    Get all posts (feed) - optional query filters: ?status=&issueType=
router.get("/", protect, getAllPosts);

// @route   GET /api/posts/my-posts
// @desc    Farmer views their own posts
router.get("/my-posts", protect, authorize("farmer"), getMyPosts);

// @route   GET /api/posts/:id
// @desc    Get single post with all comments
router.get("/:id", protect, getPostById);

// NOTE: comment routes (expert-comment, community-comment) moved to
// commentRoutes.js, mounted separately at /api/comments in server.js

// @route   PUT /api/posts/:id
// @desc    Farmer edits their own post
router.put("/:id", protect, authorize("farmer"), updatePost);

// @route   DELETE /api/posts/:id
// @desc    Farmer deletes their own post
router.delete("/:id", protect, authorize("farmer"), deletePost);

module.exports = router;