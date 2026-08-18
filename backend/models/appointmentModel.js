const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expert: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional - link back to the crop issue post that prompted this booking
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Tomato leaves showing fungal infection, need expert consultation"
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      // e.g. "10:00 AM - 10:30 AM" - keeping this simple as a string for now
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      // "pending"   -> booked but payment not yet confirmed
      // "confirmed" -> payment successful, appointment locked in
      // "completed" -> consultation happened
      // "cancelled" -> farmer or expert cancelled
    },

    // --- Payment details (eSewa) ---
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
    },
    // Unique ID we generate for this transaction, sent to eSewa and used to verify the callback
    transactionUuid: {
      type: String,
      required: true,
      unique: true,
    },
    // eSewa's reference ID for the transaction, received after successful payment
    esewaRefId: {
      type: String,
    },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

module.exports = mongoose.model("Appointment", appointmentSchema);