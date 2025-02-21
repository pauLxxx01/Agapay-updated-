const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportSchema = new mongoose.Schema(
  {
    emergency: {
      type: String,
      enum: [
        "Fire Emergency",
        "Medical Assistance",
        "Natural Hazard",
        "Crime & Violence",
        "Biological Hazard",
        "Facility Failure",
      ],
      required: true,
    },
    adminLat: {
      type: Number,
    },
    adminLong: {
      type: Number,
    },

    lat: {
      type: Number,
      required: true,
    },
    long: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    percentage: {
      type: String,
      default: "0%",
    },
    message: {
      type: String,
    },
    chat: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    respond: {
      type: String,
      enum: ["completed", "in-progress", "pending"],
      default: "pending",
    },
    responder: [
      {
        type: Schema.Types.ObjectId,
        ref: "Responder",
      },
    ],

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
