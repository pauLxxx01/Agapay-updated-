const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
    },
    senderId: {
      type: Schema.Types.ObjectId,
    },
    message: {
      type: String,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Report",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
