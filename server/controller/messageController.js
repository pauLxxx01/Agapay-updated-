const messageModel = require("../model/messageModel");
const reportModel = require("../model/reportModel");
const { sendMessages } = require("../sockets/socket");

const sendMessage = async (req, res) => {
  try {
    const { message, sender, senderId, room } = req.body;

    const messageReport = await reportModel.findById(room);
    if(!messageReport){
      return res.status(404).send({
        success: false,
        message: "Room not found",
      });
    }
    if (!senderId) {
      return res
        .status(400)
        .send({ success: false, message: "Sender's ID is required" });
    }
    if (!message) {
      return res
        .status(400)
        .send({ success: false, message: "Message is required" });
    }
    if (!sender) {
      return res
        .status(400)
        .send({ success: false, message: "Sender Id is required" });
    }
    if (!room) {
      return res
        .status(400)
        .send({ success: false, message: "Sender Id is required" });
    }
    const newMessage = new messageModel({
      sender: sender,
      message: message,
    });

    await newMessage.save();

    sendMessages(message, sender, senderId, room);

    return res.status(200).send({
      success: true,
      message: "Message successfully",
      data: newMessage,
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

const getMessage = async (req, res) => {
  try {
    const messages = await messageModel.find();
    return res.status(200).json({
      success: true,
      message: "Chats retrieved successfully",
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

module.exports = {
  sendMessage,
  getMessage,
};
