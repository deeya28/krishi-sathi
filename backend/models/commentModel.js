const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentType: {
      type: String,
      enum: ["expert", "community", "farmer"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    recommendedMarketValue: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      default: "per kg",
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
