const feedbackModel = require("../model/feedbackModel");
const userModel = require("../model/userModel");

const sendFeedback = async (req, res) => {
  try {
    const { name, rate, improvement, feedback, feedbackSenderId } = req.body;
    
    const newFeedback = new feedbackModel({
      name: name,
      rate: rate,
      improvements: improvement,
      feedback: feedback,
      feedbackSender: feedbackSenderId,
    });
    const savedFeedback = await newFeedback.save();

    const user = await userModel.findById(feedbackSenderId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.feedbacks = user.feedbacks || [];
    user.feedbacks.push(savedFeedback._id);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Feedback sent successfully",
      feedback: savedFeedback,
    });
  } catch (error) {
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
    });
  }
};

module.exports = {
    sendFeedback
}