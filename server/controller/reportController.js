const userModel = require("../model/userModel");
const ReportModel = require("../model/reportModel");
const { sendReport, updateProgress } = require("../sockets/socket");
const messageModel = require("../model/messageModel");

const sendReportToAdmin = async (req, res) => {
  try {
    const { emergency, location, message, senderId, percentage } = req.body;

    if (!req.file) {
      console.error("No file uploaded!.");
      return res.status(400).send("No file uploaded!!.");
    }
    if (!emergency) {
      console.log("ERROR ", emergency);
      return res
        .status(400)
        .send({ success: false, message: "Emergency type is required" });
    }

    if (!location) {
      console.log("ERROR ", location);
      return res
        .status(400)
        .send({ success: false, message: "Location is required" });
    }

    if (!message) {
      console.log("ERROR ", message);
      return res
        .status(400)
        .send({ success: false, message: "Message is required" });
    }

    const user = await userModel.findById(senderId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User  not found",
      });
    }
    console.log(`user id: ${user}`);

    const newMessage = new ReportModel({
      emergency,
      location,
      percentage,
      img: req.file ? req.file.filename : null, // Check if req.file exists
      message,
      senderId,
    });

    const savedMessage = await newMessage.save();

    // Save the new message ID to the user's messages array
    user.report_data = user.report_data || []; // Ensure messages array exists
    user.report_data.push(savedMessage._id); // Add the new message ID
    await user.save(); // Save the updated user document

    const newRoom = new messageModel({
      room: savedMessage._id,
    });
    await newRoom.save();
    
    sendReport(
      emergency,
      location,
      message,
      senderId,
      percentage,
      req.file.filename
    );

    console.log(user.message);
    return res.status(201).send({
      success: true,
      message: "Message reported successfully",
      data: savedMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getReportMessages = async (req, res) => {
  try {
    const messages = await ReportModel.find();

    // Return a success response with a 200 status code
    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      messages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);

    // Return a more specific error message if needed
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getSpecificReportMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const message = await ReportModel.findById(id);

    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }
    const findMessage = await ReportModel.findById(id);
    res.status(200).send({
      success: true,
      message: "Message retrieved successfully",
      data: findMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error retrieving user",
    });
  }
};

const updateReportMessage = async (req, res) => {
  const { id } = req.params; // Assuming the ID comes from the request parameters
  const { respond, percentage, userId } = req.body; // Assuming the respond data comes from the request body

  try {
    const updatedMessage = await ReportModel.findByIdAndUpdate(
      id,
      { respond, percentage },
      { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators` ensures validation
    );

    updateProgress(userId, percentage, id);

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json(updatedMessage);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteReportMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const messageExists = await ReportModel.findOne({ _id: id });
    if (!messageExists) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }

    const deletedMessage = await ReportModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Message deleted successfully",
      message: deletedMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error deleting message",
    });
  }
};

module.exports = {
  sendReportToAdmin,
  getReportMessages,
  getSpecificReportMessage,
  updateReportMessage,
  deleteReportMessage,
};
