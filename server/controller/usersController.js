const { hashPassword, comparePassword } = require("../helpers/authHelper");
const parentModel = require("../model/parentModel");
const userModel = require("../model/userModel");

const JWT = require("jsonwebtoken");

const updateAccounts = async (req, res) => {
  try {
    const {
    //for user
      role,
      name,
      email,
      password,
      account_id,
      phone_number,

      alt_phone_number,
      degree,
      school_year,
      alt_address,

      department,
      address,
      
      // for parent
      parentName,
      parentAddress,
      parentPhone,
      parentRelationship,

      parentAltPhone,
      parentAltAddress
    } = req.body;

    const id = req.params.id; // Get the user ID from the request parameters

    if (password && password.length < 8) {
      return res.status(400).send({
        success: false,
        message: "User password should be at least 8 characters long!",
      });
    }

    // Ensure account_id is not already in use by another user
    const existingUser = await userModel.findOne({ account_id, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User ID already exists",
      });
    }

    // Prepare the update object for the user
    const updateData = {
      role,
      name,
      email,
      account_id,
      phone_number,
      alt_phone_number,
      degree,
      school_year,
      department,
      address,
      alt_address,
    };

    if (password) {
      // Hash password only if it's provided
      updateData.password = await hashPassword(password);
    }

    // Updating user
    const updatedUser = await userModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Prepare parent update data
    const parentUpdateData = {
      name: parentName,
      phone: parentPhone,
      alt_phone: parentAltPhone,
      address: parentAddress,
      alt_address: parentAltAddress,
      relationship: parentRelationship,


      children: updatedUser._id,  // Ensure user is linked to parent
    };

    // Try updating the existing parent
    const updatedParent = await parentModel.findByIdAndUpdate(
      updatedUser.parent,  // Assuming the `parent` field on the user model stores the parent's ID
      parentUpdateData,
      { new: true }
    );

    // If the parent does not exist, create a new parent
    if (!updatedParent) {
      const newParent = new parentModel(parentUpdateData);
      await newParent.save();
      updatedUser.parent = newParent._id;  // Link user to the newly created parent
      await updatedUser.save();
    }

    console.log(`User updated: ${updatedUser.name && updatedUser._id}`);
    return res.status(200).send({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error updating user and parent",
      error: error,
    });
  }
};

const getToken = async (req, res) => {
  const { token} = req.body;
  const id = req.params.id;
  await userModel.findByIdAndUpdate(id, {pushToken: token}, {new: true});

  res.send({message: 'Token saved successfully!'})
}

const registerUserController = async (req, res) => {
  try {
    const {
      //for user
      role,
      name,
      email,
      password,
      account_id,
      phone_number,

      alt_phone_number,
      degree,
      school_year,
      alt_address,

      department,
      address,
      
      // for parent
      parentName,
      parentAddress,
      parentPhone,
      parentRelationship,

      parentAltPhone,
      parentAltAddress
      
    } = req.body;

    const phoneNumberRegex = /^[0-9]{11}$/;
    if (!phoneNumberRegex.test(phone_number)) {
      return res.status(400).send({
        success: false,
        message: "Invalid phone number format",
      });
    }
    if (!phoneNumberRegex.test(alt_phone_number)) {
      return res.status(400).send({
        success: false,
        message: "Invalid phone number format",
      });
    }
    if (!phoneNumberRegex.test(parentPhone)) {
      return res.status(400).send({
        success: false,
        message: "Invalid phone number format",
      });
    }
    if (!phoneNumberRegex.test(parentAltPhone)) {
      return res.status(400).send({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Validate required fields
    const requiredFields = [
      // for parent
      "parentName",
      "parentAddress",
      "parentPhone",
      "parentRelationship",
      "parentAltPhone",
      "parentAltAddress",
      // for user
      "role",
      "name",
      "email",
      "password",
      "account_id",
      "phone_number",
      "department",
      "address",
      "alt_phone_number",
      "degree",
      "school_year",
      "alt_address",

    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).send({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (password.length < 8) {
      return res.status(400).send({
        success: false,
        message: "User password should be at least 8 characters long!",
      });
    }

    const existingUser = await userModel.findOne({ account_id });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User ID already exists",
      });
    }

    //hashing password
    const hashedPassword = await hashPassword(password);

    // creating new user
    const newUser = new userModel({
      role,
      name,
      email,
      password: hashedPassword,
      account_id,
      phone_number,
      alt_phone_number,
      degree,
      school_year,
      department,
      address,
      alt_address,
    });

    //saving user
    const savedUser = await newUser.save();

    // creating new parent
    const newParent = new parentModel({
      name: parentName,
      phone: parentPhone,
      alt_phone: parentAltPhone,
      address: parentAddress,
      alt_address: parentAltAddress,
      relationship: parentRelationship,
      children: savedUser._id,
    });

    // saving parent
    const savedParent = await newParent.save();

    // linking user to parent
    savedUser.parent = savedParent._id;
    await savedUser.save();

    console.log(`User saved: ${savedUser.name && savedUser._id}`);
    return res.status(201).send({
      success: true,
      message: "User registered successfully",
      user: savedUser,
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

const getUser = async (req, res) => {
  try {
    const user = await userModel.find();
    res.status(200).send({
      success: true,
      message: "Users retrieved successfully",
      users: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const getSpecificUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await userModel.findOne({ _id: id });

    if (!userExist) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    const findUsers = await userModel.findById(id);
    res.status(200).send({
      success: true,
      message: "User retrieved successfully",
      user: findUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error retrieving user",
    });
  }
};
const getSpecificParent = async (req, res) => {
  try {
    const id = req.params.id;
    const parentExist = await parentModel.findOne({ _id: id });
    if (!parentExist) {
      return res.status(404).send({
        success: false,
        message: "Parent not found",
      });
    }
    const findParents = await parentModel.findById(id);
    res.status(200).send({
      success: true,
      message: "Parent retrieved successfully",
      parent: findParents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error retrieving parent",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await userModel.findOne({ _id: id });

    if (!userExist) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    const deletedUser = await userModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
    console.log(`User deleted: ${deletedUser.name}`);
    console.log("\n\nUser and parent deleted successfully!\n\n");
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const getParent = async (req, res) => {
  try {
    const parent = await parentModel.find();
    res.status(200).send({
      success: true,
      message: "Users retrieved successfully",
      parents: parent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const deleteParent = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await parentModel.findOne({ _id: id });

    if (!userExist) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    const deletedUser = await parentModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Parent deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error deleting Parent",
    });
  }
};

// LOGIN USER (MOBILE)
const loginController = async (req, res) => {
  try {
    const { account_id, password } = req.body;

    if (!account_id || !password) {
      return res.status(500).send({
        success: false,
        message: "Please provide both student number and password",
      });
    }

    const user = await userModel.findOne({ account_id });

    if (!user) {
      console.log("User not found");
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Check if the password matches
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Incorrect password",
      });
    }

    //Token JWT
    const token = JWT.sign({ _id: user._id, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "1y", // 1 hour token expiry
    });
    
    const decodedToken = JWT.decode(token);
    console.log(decodedToken, decodedToken.exp);

    res.status(200).send({
      success: true,
      message: "User logged in successfully",
      token,
      user,
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

module.exports = {
  //for user and parent
  registerUserController,
  updateAccounts,

  //for user
  getUser,
  deleteUser,
  getToken,

  //mobile
  loginController,

  //for parent
  deleteParent,
  getParent,
  getSpecificParent,

  //specific for user._id
  getSpecificUser,
};
