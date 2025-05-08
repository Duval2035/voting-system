// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { generateOTP, sendOtp } = require("../utils/sendOtp");

exports.register = async (req, res) => {
  const { username, email, password, organizationName, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, organizationName, role });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        organizationName: user.organizationName,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.sendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    await Otp.findOneAndDelete({ email });
    await Otp.create({ email, otp });
    await sendOtp(email, otp);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyOtpLogin = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    await Otp.deleteOne({ _id: record._id });

    res.status(200).json({ message: "Login successful", user, token });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
