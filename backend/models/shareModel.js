const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shareSchema = new Schema(
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
  { timestamps: true }
);
// No unique index - a user can share the same post more than once

module.exports = mongoose.model("Share", shareSchema);