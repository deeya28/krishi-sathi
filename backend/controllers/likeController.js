const Like = require("../models/likeModel");
const Post = require("../models/postModel");

// @desc    Toggle like on a post (like if not liked, unlike if already liked)
// @route   POST /api/likes/:postId
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingLike = await Like.findOne({ post: postId, user: req.user._id });

    if (existingLike) {
      // Already liked -> unlike (remove it)
      await existingLike.deleteOne();
      const likeCount = await Like.countDocuments({ post: postId });
      return res.status(200).json({ message: "Post unliked", liked: false, likeCount });
    }

    // Not liked yet -> like (create it)
    await Like.create({ post: postId, user: req.user._id });
    const likeCount = await Like.countDocuments({ post: postId });
    res.status(201).json({ message: "Post liked", liked: true, likeCount });
  } catch (error) {
    // Handles the rare race-condition case where the unique index blocks a duplicate
    if (error.code === 11000) {
      return res.status(409).json({ message: "You already liked this post" });
    }
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
};

// @desc    Get like count and list of users who liked a post
// @route   GET /api/likes/:postId
// @access  Private
exports.getLikesByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const likes = await Like.find({ post: postId }).populate("user", "name email");
    const likeCount = likes.length;

    // Check if the current logged-in user has liked this post
    const likedByMe = likes.some((like) => like.user._id.toString() === req.user._id.toString());

    res.status(200).json({ likeCount, likedByMe, likes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching likes", error: error.message });
  }
};