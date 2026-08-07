const Post = require("../models/postModel"); // adjust path to match your folder structure
const Like = require("../models/likeModel");

// @desc    Create a new post (any user - farmer, expert, or community - shares an
// update, question, or crop issue with photos/videos)
// @route   POST /api/posts
// @access  Private (farmer, agricultural_expert, community_user)
exports.createPost = async (req, res) => {
  try {
    const { cropName, description, issueType, media, location } = req.body;

    if (!cropName || !description) {
      return res.status(400).json({ message: "Crop name and description are required" });
    }

    const post = await Post.create({
      farmer: req.user._id, // schema field name is "farmer" but stores the post's author regardless of role
      cropName,
      description,
      issueType,
      media, // expects [{ url, type }] — if using multer, build this array from req.files first
      location,
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
};

// @desc    Get all posts (feed for experts/community)
// @route   GET /api/posts
// @access  Private
exports.getAllPosts = async (req, res) => {
  try {
    const { status, issueType } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (issueType) filter.issueType = issueType;

    const posts = await Post.find(filter)
      .populate("farmer", "name email")
      .sort({ createdAt: -1 });

    // Get like counts for all these posts in one query (avoids N+1 queries)
    const postIds = posts.map((p) => p._id);
    const likeCounts = await Like.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]);
    const likeCountMap = {};
    likeCounts.forEach((lc) => {
      likeCountMap[lc._id.toString()] = lc.count;
    });

    // Find which of these posts the current user has liked
    const myLikes = await Like.find({ post: { $in: postIds }, user: req.user._id }).select("post");
    const likedPostIds = new Set(myLikes.map((l) => l.post.toString()));

    const postsWithLikes = posts.map((post) => {
      const postObj = post.toObject();
      postObj.likeCount = likeCountMap[post._id.toString()] || 0;
      postObj.likedByMe = likedPostIds.has(post._id.toString());
      return postObj;
    });

    res.status(200).json({ count: postsWithLikes.length, posts: postsWithLikes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("farmer", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Comments now live in their own collection - fetch them separately
    const Comment = require("../models/commentModel");
    const comments = await Comment.find({ post: post._id })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    // Like count + whether current user liked this post
    const likeCount = await Like.countDocuments({ post: post._id });
    const likedByMe = !!(await Like.findOne({ post: post._id, user: req.user._id }));

    const postObj = post.toObject();
    postObj.likeCount = likeCount;
    postObj.likedByMe = likedByMe;

    res.status(200).json({ post: postObj, comments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
};

// @desc    Get all posts created by the logged-in farmer
// @route   GET /api/posts/my-posts
// @access  Private (farmer)
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching your posts", error: error.message });
  }
};

// NOTE: addExpertComment and addCommunityComment used to live here, writing
// directly into post.expertComments / post.communityComments. Comments now
// live in their own collection - see commentController.js for
// addComment / getCommentsByPost.

// @desc    Delete a post (only by the farmer who created it)
// @route   DELETE /api/posts/:id
// @access  Private (farmer)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};