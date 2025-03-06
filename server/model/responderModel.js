const mongoose = require("mongoose");
const { Schema } = mongoose;

const responderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    account_id: {
      type: String,
    },
    phone: {
      type: String,
      required: [true, "Please add phone number"],
      unique: true,
    },
    emergency_role: {
      type: String,
      required: true,
    },
    university_office: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    alt_address: {
      type: String,
    },
    birthdate: {
      type: String,
    },
    alt_phone: {
      type: String,
      required: [true, "Please add phone number"],
      unique: true,
    },
    report: [
      {
        type: Schema.Types.ObjectId,
        ref: "Report",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Responder", responderSchema);
