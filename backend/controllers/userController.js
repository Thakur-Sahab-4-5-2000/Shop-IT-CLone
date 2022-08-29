const userSchema = require("../models/userModel");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

dotenv.config({ path: "./config/config.env" });

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const userExist = await userSchema.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(200).send("Email already exists go for login");
    }
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(req.body.password, salt);
    const user = await new userSchema({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      avatar: {
        public_id: "public_id",
        url: "url",
      },
    });
    await user.save();
    res.status(200).send("User created successfully");
  } catch (err) {
    res.status(400).send(err);
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("Enter correct credentials");
    }
    const isMatch = await bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) {
      return res.status(404).send("Invalid credentials");
    }
    const { _id, name, email, avatar, isAdmin } = user._doc;

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    res
      .cookie("token", token, { httpOnly: true })
      .status(200)
      .json({ _id, name, email, avatar, isAdmin });
  } catch (err) {
    res.status(400).send(err);
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).send("Logged out successfully");
};

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userExist = await userSchema.findOne({ email: req.body.email });
  try {
    if (!userExist) {
      return res.status(404).send("User not found");
    }

    const resetUser = userExist.getresetPasswordToken();
    await userExist.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/resetPassword/${resetUser}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetPasswordUrl}`;

    await sendEmail({
      email: userExist.email,
      subject: "Pasword Reset email",
      message,
    });
    res.status(200).json({ suceess: true, message: "Email sent successfully" });
  } catch (e) {
    userExist.resetPasswordToken = undefined;
    userExist.resetPasswordExpire = undefined;
    await userExist.save({ validateBeforeSave: false });
    res.status(400).send(e);
  }
};

const resetPasswordUrl = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await userSchema.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(404)
        .send("Reset Password Token is invalid or has expired");
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).send("Password does not match");
    }
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(req.body.password, salt);
    user.password = hash;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();
    res.status(200).send("Password updated successfully");
  } catch (e) {
    res.status(400).send(e);
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await userSchema.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const { _id, name, email, avatar, isAdmin } = user._doc;
    res.status(200).json({ avatar, _id, name, email, isAdmin });
  } catch (e) {
    res.status(400).send(e);
  }
};

const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await userSchema.findById(req.user.id);
    if (!user) {
      return res.status(404).send("You are not authorized");
    }
    const isMatch = await bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) {
      return res.status(404).send("Invalid credentials");
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).send("Password does not match");
    }
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(req.body.newPassword, salt);
    user.password = hash;
    await user.save();
    res.status(200).send("Password updated successfully");
  } catch (err) {
    res.status(400).send(err);
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await userSchema.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User are not allowed to update the profile");
    }
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };
    const updated = await userSchema.findByIdAndUpdate(
      req.user.id,
      newUserData,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json(updated);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userSchema.find();
    res.status(200).json(users);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getSingleUser = async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const { _id, name, email, avatar, isAdmin } = user._doc;
    res.status(200).json({ avatar, _id, name, email, isAdmin });
  } catch (e) {
    res.status(400).send(e);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.isAdmin = req.body.isAdmin;
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e);
  }
};

const deleteProfile = async (req, res) => {
  try {
    const user = await userSchema.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    await user.remove();
    res.status(200).send("Your profile has been removed");
  } catch (e) {
    res.status(400).send(e);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    await user.remove();
    res.status(200).send("User deleted successfully");
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = {
  registerUser,
  login,
  logout,
  forgotPassword,
  resetPasswordUrl,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  deleteProfile,
  deleteUser,
  updateUserRole,
};
