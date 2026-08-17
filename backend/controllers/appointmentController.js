const crypto = require("crypto");
const Appointment = require("../models/appointmentModel");
const { User } = require("../models/userModel");
const { createNotification } = require("./notificationController");

// --- eSewa configuration ---

const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

const ESEWA_FORM_URL =
  process.env.ESEWA_FORM_URL ||
  "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

const ESEWA_STATUS_URL =
  process.env.ESEWA_STATUS_URL ||
  "https://rc.esewa.com.np/api/epay/transaction/status/";

const SUCCESS_URL = process.env.ESEWA_SUCCESS_URL;
const FAILURE_URL = process.env.ESEWA_FAILURE_URL;

const FRONTEND_URL = process.env.FRONTEND_URL;

// Generates the HMAC-SHA256 signature eSewa requires, base64-encoded
function generateSignature(totalAmount, transactionUuid, productCode) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
  hmac.update(message);
  return hmac.digest("base64");
}

// @desc    Farmer books an appointment with an expert and gets eSewa payment form data
// @route   POST /api/appointments
// @access  Private (farmer)
exports.createAppointment = async (req, res) => {
  try {
    const { expertId, postId, reason, appointmentDate, timeSlot, amount } = req.body;

    if (!expertId || !reason || !appointmentDate || !timeSlot || !amount) {
      return res.status(400).json({
        message: "expertId, reason, appointmentDate, timeSlot, and amount are required",
      });
    }

    // Confirm the chosen expert actually exists and has the expert role
    const expert = await User.findById(expertId);
    if (!expert || expert.role !== "agricultural_expert") {
      return res.status(404).json({ message: "Selected expert not found" });
    }

    // Unique transaction ID - eSewa requires this to be unique per payment attempt
    const transactionUuid = `KS-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const appointment = await Appointment.create({
      farmer: req.user._id,
      expert: expertId,
      post: postId || undefined,
      reason,
      appointmentDate,
      timeSlot,
      amount,
      transactionUuid,
      status: "pending",
      paymentStatus: "unpaid",
    });

    // Build the signed payload the frontend will POST to eSewa's form URL
    const productCode = ESEWA_MERCHANT_CODE;
    const taxAmount = 0;
    const totalAmount = amount; // no tax/delivery/service charge for this use case

    const signature = generateSignature(totalAmount, transactionUuid, productCode);

    const esewaPayment = {
      amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: SUCCESS_URL,
      failure_url: FAILURE_URL,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    res.status(201).json({
      message: "Appointment created. Redirect the user to eSewa using the form data below.",
      appointment,
      esewaFormUrl: ESEWA_FORM_URL,
      esewaPayment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating appointment", error: error.message });
  }
};

// @desc    Handle eSewa's redirect after a successful payment
// @route   GET /api/appointments/verify
// @access  Public (eSewa redirects the user's browser here, no auth token available)
exports.verifyPayment = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) {
      return res.redirect(`${FRONTEND_URL}/appointment-failed?reason=missing_data`);
    }

    // eSewa sends a base64-encoded JSON string in the "data" query param
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

    const { transaction_uuid, total_amount, product_code, status, signature } = decoded;

    // Rebuild the signature ourselves and compare - this proves the response
    // actually came from eSewa and wasn't tampered with
    const expectedSignature = generateSignature(total_amount, transaction_uuid, product_code);
    if (expectedSignature !== signature) {
      return res.redirect(`${FRONTEND_URL}/appointment-failed?reason=invalid_signature`);
    }

    const appointment = await Appointment.findOne({ transactionUuid: transaction_uuid });
    if (!appointment) {
      return res.redirect(`${FRONTEND_URL}/appointment-failed?reason=not_found`);
    }

    if (status !== "COMPLETE") {
      appointment.paymentStatus = "failed";
      await appointment.save();
      return res.redirect(`${FRONTEND_URL}/appointment-failed?reason=incomplete&appointmentId=${appointment._id}`);
    }

    // Double-check directly with eSewa's status API as a second layer of verification
    // (defends against a forged/replayed redirect)
    const statusCheckUrl = `${ESEWA_STATUS_URL}?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
    const statusResponse = await fetch(statusCheckUrl);
    const statusData = await statusResponse.json();

    if (statusData.status !== "COMPLETE") {
      appointment.paymentStatus = "failed";
      await appointment.save();
      return res.redirect(`${FRONTEND_URL}/appointment-failed?reason=status_check_failed&appointmentId=${appointment._id}`);
    }

    appointment.paymentStatus = "paid";
    appointment.status = "confirmed";
    appointment.esewaRefId = decoded.ref_id || statusData.ref_id;
    await appointment.save();

    // Notify both the farmer and the expert that the appointment is confirmed
    await createNotification({
      recipient: appointment.farmer,
      type: "appointment",
      text: "Your appointment has been confirmed and paid.",
      relatedAppointment: appointment._id,
    });
    await createNotification({
      recipient: appointment.expert,
      type: "appointment",
      text: "You have a new confirmed appointment booking.",
      relatedAppointment: appointment._id,
    });

    res.redirect(`${FRONTEND_URL}/appointment-success?appointmentId=${appointment._id}`);
  } catch (error) {
    res.redirect(`${FRONTEND_URL}/appointment-failed?reason=server_error`);
  }
};

// @desc    Handle eSewa's redirect after a failed/cancelled payment
// @route   GET /api/appointments/payment-failed
// @access  Public
exports.paymentFailed = async (req, res) => {
  try {
    const { transaction_uuid } = req.query;

    if (transaction_uuid) {
      await Appointment.findOneAndUpdate(
        { transactionUuid: transaction_uuid },
        { paymentStatus: "failed" }
      );
    }

    res.redirect(`${FRONTEND_URL}/appointment-failed?reason=cancelled_or_declined`);
  } catch (error) {
    res.redirect(`${FRONTEND_URL}/appointment-failed?reason=server_error`);
  }
};

// @desc    Get list of all experts (for farmer to choose from when booking)
// @route   GET /api/appointments/experts
// @access  Private (farmer)
exports.getExperts = async (req, res) => {
  try {
    const experts = await User.find({ role: "agricultural_expert" }).select("name email");
    res.status(200).json({ count: experts.length, experts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching experts", error: error.message });
  }
};

// @desc    Get logged-in farmer's own appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (farmer)
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ farmer: req.user._id })
      .populate("expert", "name email")
      .populate("post", "cropName")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

// @desc    Get logged-in expert's appointments (bookings made with them)
// @route   GET /api/appointments/expert-appointments
// @access  Private (expert)
exports.getExpertAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ expert: req.user._id })
      .populate("farmer", "name email")
      .populate("post", "cropName")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

// @desc    Cancel an appointment (farmer or expert)
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const isFarmer = appointment.farmer.toString() === req.user._id.toString();
    const isExpert = appointment.expert.toString() === req.user._id.toString();
    if (!isFarmer && !isExpert) {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling appointment", error: error.message });
  }
};