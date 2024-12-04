const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedBackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    rate: {
      type: String,
       default: "0"
    },
    improvements: [
      {
        type: String,
      },
    ],
    feedback: {
      type: String,
    },
    feedbackSender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Feedback", feedBackSchema);
