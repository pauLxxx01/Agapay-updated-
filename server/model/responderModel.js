const mongoose = require("mongoose");
const { Schema } = mongoose;

const responderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please add phone number"],
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    messageId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Responder", responderSchema);
