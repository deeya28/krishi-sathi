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

// --- User story 1: View list of available experts ---
// @route   GET /api/appointments/experts
// @desc    Farmer views all available experts to choose from when booking
router.get("/experts", protect, authorize("farmer"), getExperts);

// --- User story 2: Book an appointment ---
// @route   POST /api/appointments
// @desc    Farmer books an appointment with a chosen expert (any time, regardless of comments)
router.post("/", protect, authorize("farmer"), createAppointment);

// --- Payment callback routes (eSewa redirects here - no auth token available) ---
// @route   GET /api/appointments/verify
router.get("/verify", verifyPayment);

// @route   GET /api/appointments/payment-failed
router.get("/payment-failed", paymentFailed);

// --- Viewing appointments (built ahead for stories 6 & 7) ---
// @route   GET /api/appointments/my-appointments
router.get("/my-appointments", protect, authorize("farmer"), getMyAppointments);

// @route   GET /api/appointments/expert-appointments
router.get("/expert-appointments", protect, authorize("agricultural_expert"), getExpertAppointments);

// --- Cancel appointment (built ahead for story 8) ---
// @route   PATCH /api/appointments/:id/cancel
router.patch("/:id/cancel", protect, cancelAppointment);

module.exports = router;