const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema(
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
  },
  { timestamps: true } // adds createdAt (when the like happened)
);

// Prevent the same user from liking the same post more than once
likeSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);