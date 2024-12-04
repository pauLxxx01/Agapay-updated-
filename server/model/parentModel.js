const mongoose = require("mongoose");
const { Schema } = mongoose;

const parentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please add phone number"],
    },
    alt_phone: {
      type: String,
    },
    address: {
      type: String,
      trim: true,
    },
    alt_address: {
      type: String,
    },
    relationship: {
      type: String,
      enum: ["Mother", "Father", "Guardian"],
      required: true,
    },
    children: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parent", parentSchema);
