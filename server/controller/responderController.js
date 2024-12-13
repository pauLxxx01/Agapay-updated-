const responderModel = require("../model/responderModel");

const registerResponder = async (req, res) => {
  try {
    const { name, account_id, phone, emergency_role, university_office } =
      req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required!",
      });
    }
    if (!account_id) {
      return res.status(400).send({
        success: false,
        message: "Account ID is required!",
      });
    }

    if (!phone) {
      return res.status(400)  .send({
        success: false,
        message: "Phone number is required!",
      });
    }
    if (!emergency_role) {
      return res.status(400).send({
        success: false,
        message: "Emergencty role is required!",
      });
    }
    if (!university_office) {
      return res.status(400).send({
        success: false,
        message: "University office is required!",
      });
    }

    // Check if the user already exists
    const existingUserPhone = await responderModel.findOne({ phone });
    if (existingUserPhone) {
      return res.status(400).send({
        success: false,
        message: "User with the same phone number already exists!",
      });
    }
    const existingAccountId = await responderModel.findOne({ account_id });
    if (existingAccountId) {
      return res.status(400).send({
        success: false,
        message: "User with the same Account ID already exists!",
      });
    }

    // Create a new responder
    const newResponder = new responderModel({
      name,
      account_id,
      phone,
      emergency_role,
      university_office,
    });

    // Save the responder
    await newResponder.save();

    res.send({
      success: true,
      message: "New responder registered successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getResponder = async (req, res) => {
  try {
    const responders = await responderModel.find();
    res.send({
      success: true,
      message: "Responders retrieved successfully!",
      data: responders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateResponder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, account_id, phone, emergency_role, university_office } =
      req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required!",
      });
    }
    if (!account_id) {
      return res.status(400).send({
        success: false,
        message: "Account ID is required!",
      });
    }
    if (!phone) {
      return res.status(400).send({
        success: false,
        message: "Phone number is required!",
      });
    }
    if (!emergency_role) {
      return res.status(400).send({
        success: false,
        message: "Update role is required!",
      });
    }
    if (!university_office) {
      return res.status(400).send({
        success: false,
        message: "University office is required!",
      });
    }

    // Find and update the responder
    const updatedResponder = await responderModel.findByIdAndUpdate(
      id,
      {
        name,
        account_id,
        phone,
        emergency_role,
        university_office,
      },
      { new: true }
    );
    res.send({
      success: true,
      message: "Responder updated successfully!",
      data: updatedResponder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteResponder = async (req, res) => {
  try {
    const { id } = req.params;

    const existingResponder = await responderModel.findById(id);
    if (!existingResponder) {
      return res.status(404).send({
        success: false,
        message: "Responder not found!",
      });
    }

    // Delete the responder
    const deletedResponder = await responderModel.findByIdAndDelete(id);

    res.send({
      success: true,
      message: "Responder deleted successfully!",
      data: deletedResponder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  registerResponder,
  getResponder,
  updateResponder,
  deleteResponder,
};
