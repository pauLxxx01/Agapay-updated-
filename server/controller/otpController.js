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
    admin.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
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

    const admin = await adminModel.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    console.log("verification token: ",token);
    if (!admin || !token) {
      return res.status(401).send({
        success: false,
        message: "Invalid token or token expired",
      });
    }

    admin.isVerified = true;
    admin.verificationToken = null;
    await admin.save();

    res.send({
      success: true,
      message: "Admin verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { verifyToken, sendingToken };
