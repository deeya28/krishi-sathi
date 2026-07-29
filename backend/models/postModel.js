const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Main Post schema
const postSchema = new Schema(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User", // or "Farmer" if you have a separate Farmer model
      required: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    issueType: {
      type: String, // e.g. "disease", "pest", "nutrient deficiency", "other"
      default: "other",
    },
    media: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "expert_responded", "resolved", "escalated"],
      default: "pending",
      // "expert_responded" -> set by commentController when an expert comment is added
      // "escalated"        -> set when farmer books an appointment due to no response
    },
    location: {
      district: { type: String, trim: true },
      state: { type: String, trim: true },
    },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

// NOTE: expertComments / communityComments used to live here as embedded
// subdocuments. Comments now live in their own collection (see commentModel.js),
// referenced by post ID. Use Comment.find({ post: postId }) to fetch them.

module.exports = mongoose.model("Post", postSchema);