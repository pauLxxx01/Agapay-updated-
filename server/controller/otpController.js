const { SendVerificationCode } = require("../helpers/email");
const adminModel = require("../model/adminModel");

const sendingToken = async (req, res) => {
  try {
    const id = req.params.id;

    const admin = await adminModel.findOne({ _id: id });

    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    admin.verificationToken = verificationToken;
    admin.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

    admin.save();

    SendVerificationCode(admin.email, verificationToken);
    console.log(admin);

    res.status(200).send({
      success: true,
      message: "Sent OTP successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    // Check if token is provided
    if (!token) {
      return res.status(400).send({
        success: false,
        message: "Token is required",
      });
    }

    // Find the admin by the verification token
    const admin = await adminModel.findOne({
      verificationToken: token,
    }); 

    // If no admin found, return invalid token message
    if (!admin) {
      return res.status(401).send({
        success: false,
        message: "Invalid token",
      });
    }

    // Check if token has expired
    if (admin.verificationTokenExpiresAt < Date.now()) {
      return res.status(401).send({
        success: false,
        message: "Token has expired",
      });
    }

    // Mark admin as verified
    admin.isVerified = true;
    admin.verificationToken = null; // Remove the token after successful verification
    admin.verificationTokenExpiresAt = null; // Remove the expiration date
    await admin.save();

    res.status(200).send({
      success: true,
      message: "Admin verified successfully",
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { verifyToken, sendingToken };
