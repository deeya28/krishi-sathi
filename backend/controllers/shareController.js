const Share = require("../models/shareModel");
const Post = require("../models/postModel");

// @desc    Record a share of a post, return the new count
// @route   POST /api/shares/:postId
// @access  Private
exports.createShare = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await Share.create({ post: post._id, user: req.user._id });
    const shareCount = await Share.countDocuments({ post: post._id });

    res.status(201).json({ shareCount });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({ message: "Error recording share", error: error.message });
  }
};

// @desc    Get share count for a post
// @route   GET /api/shares/:postId
// @access  Private
exports.getShareCount = async (req, res) => {
  try {
    const shareCount = await Share.countDocuments({ post: req.params.postId });
    res.status(200).json({ shareCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching share count", error: error.message });
  }
};