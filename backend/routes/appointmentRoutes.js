const express = require("express");
const router = express.Router();

const {
  getExperts,
  createAppointment,
  verifyPayment,
  paymentFailed,
  getMyAppointments,
  getExpertAppointments,
  cancelAppointment,
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const ANY_ROLE = [
  "farmer",
  "agricultural_expert",
  "community_user",
  "admin",
];

// ==========================================
// GET ALL AGRICULTURAL EXPERTS
// ==========================================
// Any logged-in user can view available experts
// @route   GET /api/appointments/experts
router.get(
  "/experts",
  protect,
  authorize(...ANY_ROLE),
  getExperts
);

// ==========================================
// CREATE APPOINTMENT
// ==========================================
// Any logged-in user can book an appointment
// @route   POST /api/appointments
router.post(
  "/",
  protect,
  authorize(...ANY_ROLE),
  createAppointment
);

// ==========================================
// PAYMENT CALLBACKS (eSewa redirects here - no auth token available)
// ==========================================
// @route   GET /api/appointments/verify
router.get("/verify", verifyPayment);

// @route   GET /api/appointments/payment-failed
router.get("/payment-failed", paymentFailed);

// ==========================================
// FARMER APPOINTMENTS
// ==========================================
// Farmer views their appointments
// @route   GET /api/appointments/my-appointments
router.get(
  "/my-appointments",
  protect,
  authorize(...ANY_ROLE),
  getMyAppointments
);

// ==========================================
// EXPERT APPOINTMENTS
// ==========================================
// Agricultural expert views appointments booked with them
// @route   GET /api/appointments/expert-appointments
router.get(
  "/expert-appointments",
  protect,
  authorize("agricultural_expert"),
  getExpertAppointments
);

// ==========================================
// CANCEL APPOINTMENT
// ==========================================
// Farmer or expert can cancel an appointment
// @route   PATCH /api/appointments/:id/cancel
router.patch(
  "/:id/cancel",
  protect,
  cancelAppointment
);

module.exports = router;