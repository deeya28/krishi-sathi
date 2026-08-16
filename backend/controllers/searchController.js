const { User } = require("../models/userModel");
const Post = require("../models/postModel");

// @desc    Search users (by name/email) and posts (by cropName/description) by keyword
// @route   GET /api/search?q=keyword
// @access  Private
exports.search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Search query 'q' is required" });
    }

    // Case-insensitive partial match, safe against regex special characters
    const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const [users, posts] = await Promise.all([
      User.find({
        $or: [{ name: regex }, { email: regex }],
      })
        .select("name email role")
        .limit(20),

      Post.find({
        $or: [{ cropName: regex }, { description: regex }],
      })
        .populate("farmer", "name email")
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    res.status(200).json({
      query: q,
      userCount: users.length,
      postCount: posts.length,
      users,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error performing search", error: error.message });
  }
};