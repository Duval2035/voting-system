const express = require("express");
const Joi = require("joi");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// 🔐 In-memory OTP store (for production, use Redis or DB)
const otpStore = new Map();

// 🔢 Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✉️ Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  service: process.env.EMAIL_SERVICE || undefined,
});

// 📩 Send OTP to email
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found." });

    const otp = generateOtp();
    otpStore.set(email, otp);

    const mailOptions = {
      from: `"Voting System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your OTP Code for Voting System",
      html: `
        <p>Hello ${user.username},</p>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This OTP is valid for a short time. Do not share it.</p>
        <p>— Voting System</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📨 OTP for ${email}: ${otp}`);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err);
    res.status(500).json({ message: "Failed to send OTP email" });
  }
});

// ✅ Verify OTP and login (returns JWT)
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required." });

  const storedOtp = otpStore.get(email);
  if (storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  otpStore.delete(email);

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found." });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "OTP verified successfully.",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        electionId: user.electionId || null,
      },
    });
  } catch (err) {
    console.error("❌ OTP Verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📦 Joi schema for registration
const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  organizationName: Joi.string().allow(""),
  role: Joi.string()
    .valid("admin", "user", "auditor", "candidate")
    .default("user"),
  electionId: Joi.when("role", {
    is: "candidate",
    then: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message("Invalid electionId");
        }
        return value;
      }, "ObjectId validation"),
    otherwise: Joi.forbidden(),
  }),
});

// 🧪 Middleware for validation
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error)
    return res.status(400).json({ message: error.details[0].message });
  next();
};

// 👤 Register user
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    let { username, email, password, organizationName, role, electionId } =
      req.body;

    email = email.trim().toLowerCase();
    if (role !== "candidate") electionId = undefined;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
      username,
      email,
      password: hashedPassword,
      organizationName,
      role,
    };

    if (role === "candidate") newUserData.electionId = electionId;

    const newUser = new User(newUserData);
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        organizationName: newUser.organizationName,
        electionId: newUser.electionId || null,
      },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

console.log("✅ authRoutes loaded");
module.exports = router;
