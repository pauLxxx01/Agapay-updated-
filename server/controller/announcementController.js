const adminModel = require("../model/adminModel");
const announceModel = require("../model/announceModel");
const { sendAnnouncementToUser } = require("../sockets/socket");

const sendAnnouncement = async (req, res) => {
  try {
    const { title, description, date, department, duration, topic, creator } =
      req.body;

    if (!title || !description || !date || !department || !duration || !topic) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }
    const admin = await adminModel.findById(creator);
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }
    const newAnnouncement = new announceModel({
      title,
      description,
      date,
      department,
      duration,
      topic,
      creator: admin._id,
    });

    const savedAnnouncement = await newAnnouncement.save();

    admin.announcement = admin.announcement || [];
    admin.announcement.push(savedAnnouncement._id);
    await admin.save();

    sendAnnouncementToUser(title, description, date, department, duration);

    res.status(200).send({
      success: true,
      message: "Announcement sent successfully",
      announcement: savedAnnouncement,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const getAnnouncement = async (req, res) => {
  try {
    const announcements = await announceModel.find();
    res.status(200).send({
      success: true,
      message: "Announcements retrieved successfully",
      announcements,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};
module.exports = {
  sendAnnouncement,
  getAnnouncement
};
