const { User } = require("../models/userModel");
const Post = require("../models/postModel");

// @desc    Get a user's public profile (no email/password)
// @route   GET /api/users/:id
// @access  Private (any logged-in user)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

// @desc    Get all posts made by a specific user
// @route   GET /api/users/:id/posts
// @access  Private (any logged-in user)
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ farmer: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ count: posts.length, posts });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Error fetching user's posts", error: error.message });
  }
};