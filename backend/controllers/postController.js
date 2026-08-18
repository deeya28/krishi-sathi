const Post = require("../models/postModel"); // adjust path to match your folder structure
const Like = require("../models/likeModel");
const { User, Roles } = require("../models/userModel");
const { createNotification } = require("./notificationController");

// @desc    Create a new post (any user - farmer, expert, or community - shares an
// update, question, or crop issue with photos/videos)
// @route   POST /api/posts
// @access  Private (farmer, agricultural_expert, community_user, admin)
exports.createPost = async (req, res) => {
  try {
    const { cropName, description, issueType, location } = req.body;

    // A post needs *something* - text, or at least one attached photo/video.
    // cropName/issueType are optional extras, not requirements.
    const hasMedia = req.files && req.files.length > 0;
    if (!description?.trim() && !hasMedia) {
      return res.status(400).json({ message: "Add some text or a photo/video to post." });
    }

    // req.files comes from the "upload.array()" multer middleware on the route.
    // Each uploaded file is already on Cloudinary by this point - multer-storage-cloudinary
    // uploads it during the multer step and gives us back the resulting URL.
    const media = (req.files || []).map((file) => ({
      url: file.path, // Cloudinary's secure URL for the uploaded file
      type: file.mimetype.startsWith("video") ? "video" : "image",
    }));

    // location may arrive as a JSON string if sent via multipart/form-data
    let parsedLocation = location;
    if (typeof location === "string") {
      try {
        parsedLocation = JSON.parse(location);
      } catch {
        parsedLocation = undefined;
      }
    }

    const post = await Post.create({
      farmer: req.user._id, // schema field name is "farmer" but stores the post's author regardless of role
      cropName: cropName || "",
      description: description?.trim() || "",
      issueType,
      media,
      location: parsedLocation,
    });

    // US-30: notify every expert when a farmer posts, so they can respond
    // promptly. Runs after the post is saved and doesn't block the response
    // if it fails - a farmer's post shouldn't fail just because notifying
    // experts had a problem.
    if (req.user.role === Roles.FARMER) {
      User.find({ role: Roles.EXPERT })
        .select("_id")
        .then((experts) => {
          experts.forEach((expert) => {
            createNotification({
              recipient: expert._id,
              type: "help_request",
              text: `${req.user.name} posted a new help request${
                cropName ? ` about ${cropName}` : ""
              }.`,
              relatedPost: post._id,
              fromUser: req.user._id,
            });
          });
        })
        .catch((err) => console.error("Failed to notify experts:", err.message));
    }

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

// @desc    Get all posts created by the logged-in user
// @route   GET /api/posts/my-posts
// @access  Private (farmer, agricultural_expert, community_user, admin)
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

// @desc    Update a post (only by the user who created it)
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    // Only update fields that were actually provided, leave the rest unchanged
    const { cropName, description, issueType, media, location } = req.body;

    if (cropName !== undefined) post.cropName = cropName;
    if (description !== undefined) post.description = description;
    if (issueType !== undefined) post.issueType = issueType;
    if (media !== undefined) post.media = media;
    if (location !== undefined) post.location = location;

    await post.save();

    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
};

// @desc    Delete a post (by the user who created it, or by an admin for moderation)
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isOwner = post.farmer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === Roles.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};