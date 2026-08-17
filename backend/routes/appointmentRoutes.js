const express = require("express");
const router = express.Router();

const {
  getExperts,
  createAppointment,
  getMyAppointments,
  getExpertAppointments,
  cancelAppointment,
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// ==========================================
// GET ALL AGRICULTURAL EXPERTS
// ==========================================
// Used by farmers when booking an appointment
router.get(
  "/experts",
  protect,
  authorize("farmer"),
  getExperts
);

// ==========================================
// CREATE APPOINTMENT
// ==========================================
// Farmer books an appointment with an expert
router.post(
  "/",
  protect,
  authorize("farmer"),
  createAppointment
);

// ==========================================
// FARMER APPOINTMENTS
// ==========================================
// Farmer views their upcoming and past appointments
router.get(
  "/my-appointments",
  protect,
  authorize("farmer"),
  getMyAppointments
);

// ==========================================
// EXPERT APPOINTMENTS
// ==========================================
// Agricultural expert views appointments booked with them
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
router.patch(
  "/:id/cancel",
  protect,
  cancelAppointment
);

module.exports = router;