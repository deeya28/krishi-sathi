const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const { createNotification } = require("./notificationController");

// @desc    Add a comment on a post (expert advice or community market value)
// @route   POST /api/comments/:postId
// @access  Private (expert or community)
exports.addComment = async (req, res) => {
  try {
    const { text, recommendedMarketValue, unit } = req.body;
    const { postId } = req.params;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Determine comment type from the logged-in user's role
    // (route-level authorize() should already restrict this to the roles below,
    // this is a second safety check)
    // NOTE: commentType values ("expert"/"community"/"farmer") stay the same -
    // only the incoming req.user.role values match your actual User model roles.
    let commentType;
    if (req.user.role === "agricultural_expert") {
      commentType = "expert";
    } else if (req.user.role === "community_user") {
      commentType = "community";
    } else if (req.user.role === "farmer") {
      commentType = "farmer";
    } else {
      return res.status(403).json({ message: "You are not allowed to comment on posts" });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      commentType,
      text,
      recommendedMarketValue: commentType === "community" ? recommendedMarketValue : undefined,
      unit: commentType === "community" ? unit : undefined,
    });

    // If this is the first expert comment, update post status
    if (commentType === "expert" && post.status === "pending") {
      post.status = "expert_responded";
      await post.save();
    }

    // Notify the post owner (skipped automatically if they commented on their own post)
    await createNotification({
      recipient: post.farmer,
      type: "comment",
      text:
        commentType === "expert"
          ? "An expert commented on your post."
          : "Someone commented on your post.",
      relatedPost: post._id,
      fromUser: req.user._id,
    });

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};

// @desc    Get all comments for a post (optionally filtered by type)
// @route   GET /api/comments/:postId?type=expert|community
// @access  Private
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.query;

    const filter = { post: postId };
    if (type) filter.commentType = type;

    const comments = await Comment.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({ count: comments.length, comments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};

// @desc    Delete a comment (by the user who created it, or by an admin for moderation)
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};