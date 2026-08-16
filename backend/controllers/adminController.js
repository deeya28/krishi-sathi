const { User } = require("../models/userModel");

// @desc    Get all experts awaiting verification
// @route   GET /api/admin/experts/unverified
// @access  Private (admin only)
exports.getUnverifiedExperts = async (req, res) => {
  try {
    const experts = await User.find({
      role: "agricultural_expert",
      isVerified: false,
    }).select("name email createdAt");

    res.status(200).json({ count: experts.length, experts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching unverified experts", error: error.message });
  }
};

// @desc    Get all verified experts
// @route   GET /api/admin/experts/verified
// @access  Private (admin only)
exports.getVerifiedExperts = async (req, res) => {
  try {
    const experts = await User.find({
      role: "agricultural_expert",
      isVerified: true,
    }).select("name email createdAt");

    res.status(200).json({ count: experts.length, experts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching verified experts", error: error.message });
  }
};

// @desc    Verify an expert (admin approves their credentials)
// @route   PATCH /api/admin/experts/:id/verify
// @access  Private (admin only)
exports.verifyExpert = async (req, res) => {
  try {
    const expert = await User.findById(req.params.id);

    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }
    if (expert.role !== "agricultural_expert") {
      return res.status(400).json({ message: "This user is not registered as an expert" });
    }

    expert.isVerified = true;
    await expert.save();

    res.status(200).json({ message: "Expert verified successfully", expert });
  } catch (error) {
    res.status(500).json({ message: "Error verifying expert", error: error.message });
  }
};

// @desc    Revoke an expert's verification
// @route   PATCH /api/admin/experts/:id/unverify
// @access  Private (admin only)
exports.unverifyExpert = async (req, res) => {
  try {
    const expert = await User.findById(req.params.id);

    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }

    expert.isVerified = false;
    await expert.save();

    res.status(200).json({ message: "Expert verification revoked", expert });
  } catch (error) {
    res.status(500).json({ message: "Error updating expert", error: error.message });
  }
};