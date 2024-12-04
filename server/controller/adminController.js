const { hashPassword, comparePassword } = require("../helpers/authHelper");
const { SendVerificationCode } = require("./../helpers/email");
const adminModel = require("../model/adminModel");
const JWT = require("jsonwebtoken");

const registerController = async (req, res) => {
  try {
    const { name, password, phoneNumber, email } = req.body;

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
    if (!phoneNumber || phoneNumber.length === 11) {
      return res.status(400).send({
        success: false,
        message:
          "Phone number is must be 11 digits long and starts with a (0) \nThank You for consideration!",
      });
    }

    //for existing user (admin)
    const existingUser = await adminModel.findOne({ name: name });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Admin already exists with this name",
      });
    }

    //hashed passowrd
    const hashedPassword = await hashPassword(password);

    //saving user (admin)
    const admin = await adminModel({
      email,
      name,
      password: hashedPassword,
      phoneNumber,
    });
    console.log(password, hashedPassword);
    await admin.save();

    console.log("Admin registered successfully");
    return res.status(201).send({
      success: true,
      message: "Admin registered successfully",
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

const loginControllers = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(500).send({
        success: false,
        message: "Name and password are required!",
      });
    }

    const admin = await adminModel.findOne({ name });

    if (!admin) {
      return res.status(500).send({
        success: false,
        message: "User not found!",
      });
    }

    //Matching password
    const isMatch = await comparePassword(password, admin.password);

    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid password!",
      });
    }

    //Token JWT
    const token = JWT.sign({ _id: admin._id, name: admin.name, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // SendVerificationCode(admin.email, verificationToken);

    res.status(200).send({
      success: true,
      message: "Logged in successfully!",
      token,
      admin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getAdmin = async (req, res) => {
  try {
    const admin = await adminModel.find();

    return res.status(200).send({
      success: true,
      message: "Admin retrieved successfully",
      admin: admin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error retrieving admin",
    });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const adminExist = await adminModel.findOne({ _id: id });

    if (!adminExist) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }
    const deletedAdmin = await adminModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Admin deleted successfully",
      admin: deletedAdmin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error deleting admin",
    });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const adminExist = await adminModel.findOne({ _id: id });
    const { name, password, phoneNumber, email } = req.body; // Get the updated data from request body

    if (!adminExist) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    //hashed passowrd
    const hashedPassword = await hashPassword(password);
    //saving user (admin)
    adminModel
      .findByIdAndUpdate(
        { _id: id },
        { email, name, password: hashedPassword, phoneNumber }
      )
      .then((admins) => res.json(admins))
      .catch((error) => res.json(error));
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error updating admin",
    });
  }
};

module.exports = {
  registerController,
  loginControllers,
  getAdmin,
  deleteAdmin,
  updateAdmin,
};
