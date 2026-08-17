const Appointment = require("../models/appointmentModel");
const { User } = require("../models/userModel");
const { createNotification } = require("./notificationController");

// ==========================================
// CREATE APPOINTMENT
// ==========================================

// @desc    Farmer books an appointment with an expert
// @route   POST /api/appointments
// @access  Private (farmer)
exports.createAppointment = async (req, res) => {
  try {
    const {
      expertId,
      postId,
      reason,
      appointmentDate,
      timeSlot,
    } = req.body;

    if (!expertId || !reason || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        message:
          "expertId, reason, appointmentDate, and timeSlot are required",
      });
    }

    // Check that the selected expert exists
    const expert = await User.findById(expertId);

    if (!expert || expert.role !== "agricultural_expert") {
      return res.status(404).json({
        message: "Selected expert not found",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      farmer: req.user._id,
      expert: expertId,
      post: postId || undefined,
      reason: reason.trim(),
      appointmentDate,
      timeSlot,
      status: "pending",
    });

    // Notify the expert
    await createNotification({
      recipient: expertId,
      type: "appointment",
      text: "You have a new appointment request from a farmer.",
      relatedAppointment: appointment._id,
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating appointment",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL EXPERTS
// ==========================================

// @desc    Get list of agricultural experts
// @route   GET /api/appointments/experts
// @access  Private (farmer)
exports.getExperts = async (req, res) => {
  try {
    const experts = await User.find({
      role: "agricultural_expert",
    }).select("name email location bio isVerified");

    res.status(200).json({
      count: experts.length,
      experts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching experts",
      error: error.message,
    });
  }
};

// ==========================================
// GET FARMER'S APPOINTMENTS
// ==========================================

// @desc    Get logged-in farmer's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (farmer)
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      farmer: req.user._id,
    })
      .populate("expert", "name email location bio")
      .populate("post", "cropName")
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

// ==========================================
// GET EXPERT'S APPOINTMENTS
// ==========================================

// @desc    Get logged-in expert's appointments
// @route   GET /api/appointments/expert-appointments
// @access  Private (expert)
exports.getExpertAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      expert: req.user._id,
    })
      .populate("farmer", "name email")
      .populate("post", "cropName")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.status(200).json({
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching expert appointments",
      error: error.message,
    });
  }
};

// ==========================================
// CANCEL APPOINTMENT
// ==========================================

// @desc    Cancel an appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private (farmer or expert)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Check whether the logged-in user is the farmer or expert
    const isFarmer =
      appointment.farmer.toString() === req.user._id.toString();

    const isExpert =
      appointment.expert.toString() === req.user._id.toString();

    if (!isFarmer && !isExpert) {
      return res.status(403).json({
        message: "Not authorized to cancel this appointment",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Appointment is already cancelled",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "Completed appointments cannot be cancelled",
      });
    }

    // Prevent cancellation after appointment date/time
    if (new Date(appointment.appointmentDate) <= new Date()) {
      return res.status(400).json({
        message: "Past appointments cannot be cancelled",
      });
    }

    appointment.status = "cancelled";

    await appointment.save();

    // Notify the other person
    const recipient = isFarmer
      ? appointment.expert
      : appointment.farmer;

    await createNotification({
      recipient,
      type: "appointment",
      text: "An appointment has been cancelled.",
      relatedAppointment: appointment._id,
    });

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error cancelling appointment",
      error: error.message,
    });
  }
};