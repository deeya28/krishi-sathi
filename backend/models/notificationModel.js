const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "appointment", "system", "help_request"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional references, depending on notification type
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    relatedAppointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    // Who triggered this notification (e.g. who liked/commented) - optional, useful for display
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);