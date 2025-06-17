const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/User");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();


const otpStore = {}; 

const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  organizationName: Joi.string().allow(""),
  role: Joi.string().valid("admin", "user", "auditor", "candidate").default("user"),
});

const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Register
router.post("/register", async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password, organizationName, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ username, email, password, organizationName, role });
    const savedUser = await newUser.save();

    const token = jwt.sign({ _id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User created", token, user: savedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Send OTP (Step 1 of login)
router.post("/send-otp", async (req, res) => {
  const { error } = emailSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email } = req.body;

  try {
    const rawEmail = req.body.email;
        const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

    
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min

    otpStore[email] = { otp, expiresAt };

    await transporter.sendMail({
      from: `"ZeroFraud Vote" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP",
      text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
    });

    console.log(`📩 OTP sent to ${email}: ${otp}`); // for dev only
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

// ✅ Verify OTP (Step 2 of login)
router.post("/verify-otp", async (req, res) => {
  const { error } = otpSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const rawEmail = req.body.email;
const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

  if (!user) return res.status(404).json({ message: "User not found" });
  const { otp } = req.body;
  const record = otpStore[email];

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ message: "OTP expired or not found" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  try {
    const user = await User.findOne({ email });
          console.log("Looking for email:", email);
          const allUsers = await User.find();
          console.log("All users in DB:", allUsers);

    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    delete otpStore[email]; // Clear OTP on success
    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
