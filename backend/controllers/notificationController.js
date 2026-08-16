const Notification = require("../models/notificationModel");

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("fromUser", "name")
      .sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.status(200).json({ count: notifications.length, unreadCount, notifications });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

// @desc    Mark one notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error: error.message });
  }
};

// @desc    Mark all of the logged-in user's notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications", error: error.message });
  }
};

// @desc    Delete all of the logged-in user's notifications
// @route   DELETE /api/notifications
// @access  Private
exports.clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing notifications", error: error.message });
  }
};

// ------------------------------------------------------------------
// Helper - NOT a route handler. Import and call this from other
// controllers (like, comment, appointment) to create a notification.
// ------------------------------------------------------------------
exports.createNotification = async ({ recipient, type, text, relatedPost, relatedAppointment, fromUser }) => {
  try {
    // Don't notify someone about their own action (e.g. liking your own post)
    if (fromUser && recipient.toString() === fromUser.toString()) return;

    await Notification.create({ recipient, type, text, relatedPost, relatedAppointment, fromUser });
  } catch (error) {
    // Notifications are non-critical - log but don't let this break the main action
    console.error("Failed to create notification:", error.message);
  }
};