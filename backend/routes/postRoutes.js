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
const { upload } = require("../config/cloudinaryConfig");

// @route   POST /api/posts
// @desc    Any logged-in user creates a new post (with up to 5 photos/videos)
router.post(
  "/",
  protect,
  authorize("farmer", "agricultural_expert", "community_user", "admin"),
  upload.array("media", 5),
  createPost
);

// @route   GET /api/posts
// @desc    Get all posts (feed) - optional query filters: ?status=&issueType=
router.get("/", protect, getAllPosts);

// @route   GET /api/posts/my-posts
// @desc    Logged-in user views their own posts
router.get(
  "/my-posts",
  protect,
  authorize("farmer", "agricultural_expert", "community_user", "admin"),
  getMyPosts
);

// @route   GET /api/posts/:id
// @desc    Get single post with all comments
router.get("/:id", protect, getPostById);

// NOTE: comment routes (expert-comment, community-comment) moved to
// commentRoutes.js, mounted separately at /api/comments in server.js

// @route   PUT /api/posts/:id
// @desc    Post owner (any role) edits their own post - ownership is checked in the controller
router.put(
  "/:id",
  protect,
  authorize("farmer", "agricultural_expert", "community_user", "admin"),
  updatePost
);

// @route   DELETE /api/posts/:id
// @desc    Post owner (any role) deletes their own post - ownership is checked in the controller
router.delete(
  "/:id",
  protect,
  authorize("farmer", "agricultural_expert", "community_user", "admin"),
  deletePost
);

module.exports = router;