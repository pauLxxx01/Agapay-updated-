const messageModel = require("../model/messageModel");
const reportModel = require("../model/reportModel");
const { sendMessages } = require("../sockets/socket");

const sendMessage = async (req, res) => {
  try {
    const messages = new messageModel({ room: req.body.room, content: [] });
    await messages.save();
    return res.status(200).send({
      success: true,
      message: "Message successfully",
      data: messages,
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
    const room = await messageModel.findOne({ room: req.params.id });
    if (!room) {
      return res.status(404).send({
        success: false,
        message: "No messages found in this room",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chats retrieved successfully",
      data: room,
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
