const Follow = require("../models/followModel");

// @desc    Follow a user, or unfollow if already following (toggle)
// @route   POST /api/follows/:userId
// @access  Private
exports.toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.userId;

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const existing = await Follow.findOne({ follower: req.user._id, following: targetId });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ following: false });
    }

    await Follow.create({ follower: req.user._id, following: targetId });
    res.status(201).json({ following: true });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Error updating follow status", error: error.message });
  }
};

// @desc    Get follow status + counts for a user (am I following them, how many followers/following do they have)
// @route   GET /api/follows/:userId
// @access  Private
exports.getFollowInfo = async (req, res) => {
  try {
    const targetId = req.params.userId;

    const [followerCount, followingCount, iFollow] = await Promise.all([
      Follow.countDocuments({ following: targetId }),
      Follow.countDocuments({ follower: targetId }),
      Follow.findOne({ follower: req.user._id, following: targetId }),
    ]);

    res.status(200).json({
      followerCount,
      followingCount,
      isFollowing: !!iFollow,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Error fetching follow info", error: error.message });
  }
};