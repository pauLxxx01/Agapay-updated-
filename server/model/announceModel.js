const mongoose = require("mongoose");
const { Schema } = mongoose;

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    date: {
      type: String,
    },
    department: {
      type: String,
    },
    duration: {
      type: String,
    },
    topic: {
      type: String,
    },
    pinned: {
      type: Boolean,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    }
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Announcement", announcementSchema);