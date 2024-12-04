const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["Student", "Professor"],
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      min: 8,
    },
    account_id: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    alt_phone_number: {
      type: String,
    },
    degree: {
      type: String,
    },
    school_year: {
      type: String,
    },
    department: {
      type: String,
    },
    address: {
      type: String,
    },
    alt_address: {
      type: String,
    },
    pushToken: {
      type: String,
    },
    report_data: [
      {
      type: Schema.Types.ObjectId,
      ref: "Report",
    },
  ],
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Parent",
    },
    feedbacks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Feedback",
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
