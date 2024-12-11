const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add password"],
      min: 8,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please add phone number"],
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    messageReport: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    role: {
      type: String,
      default: "admin",
    },
    announcement: [
      {
        type: Schema.Types.ObjectId,
        ref: "Announcement",
      },
    ],
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);
module.exports = mongoose.model("Admin", adminSchema);
