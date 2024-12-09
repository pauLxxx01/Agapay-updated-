const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
    },
    content: [
      {
        sender: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
