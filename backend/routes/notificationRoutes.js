const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/notifications
router.get("/", protect, getMyNotifications);

// @route   PATCH /api/notifications/read-all
router.patch("/read-all", protect, markAllAsRead);

// @route   PATCH /api/notifications/:id/read
router.patch("/:id/read", protect, markAsRead);

// @route   DELETE /api/notifications
router.delete("/", protect, clearNotifications);

module.exports = router;