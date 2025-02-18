const { hashPassword } = require("../helpers/authHelper");
const subAdminModel = require("../model/subAdminModel");

const registerController = async (req, res) => {
  try {
    const { name, password, phoneNumber, email, role } = req.body;
    const phoneNumberRegex = /^[0-9]{11}$/;

    if (!role) {
      return res.status(400).send({
        success: false,
        message: "Role is required",
      });
    }

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!password || password.length < 8) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }
    if (!phoneNumber) {
      return res.status(400).send({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!phoneNumberRegex.test(phoneNumber)) {
      return res.status(400).send({
        success: false,
        message:
          "Phone number is must be 11 digits long and starts with a (0) \nThank You for consideration!",
      });
    }

    //for existing user
    const exisitingUser = await subAdminModel.findOne({ name: name });
    if (exisitingUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists",
      });
    }
    //for existing email
    const exisitingEmail = await subAdminModel.findOne({ email: email });
    if (exisitingEmail) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
      });
    }
    //for existing phone number
    const exisitingPhone = await subAdminModel.findOne({
      phoneNumber: phoneNumber,
    });
    if (exisitingPhone) {
      return res.status(400).send({
        success: false,
        message: "Phone number already exists",
      });
    }
    const hashedPassword = await hashPassword(password);
    const subAdmin = await subAdminModel({
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      password: hashedPassword,
      role: role,
    });
    await subAdmin.save();
    console.log("Sub-Admin registered successfully");
    return res.status(201).send({
      success: true,
      message: "Sub Admin created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

module.exports = {registerController};