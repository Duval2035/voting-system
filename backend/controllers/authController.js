const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const User = require("../models/User");
const Election = require("../models/Election");
const Otp = require("../models/Otp");

// Setup email transporter with Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Register User
exports.register = async (req, res) => {
  let { username, email, password, organizationName, role, electionId } = req.body;
  email = email.trim().toLowerCase();

  try {
    if (role === "candidate") {
      if (!electionId || !mongoose.Types.ObjectId.isValid(electionId)) {
        return res.status(400).json({ message: "Invalid electionId" });
      }
    } else {
      // Remove electionId if role is not candidate to avoid validation errors
      electionId = undefined;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
      username,
      email,
      password: hashedPassword,
      organizationName,
      role,
    };

    if (role === "candidate") {
      newUserData.electionId = electionId;
    }

    const newUser = new User(newUserData);
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
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
};

// Send OTP to user email
exports.sendOtp = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // valid for 5 minutes

    // Upsert OTP record for this email
    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send email with OTP
    await transporter.sendMail({
      from: `"YourAppName" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    console.log(`🔐 OTP for ${email}: ${otp}`); // log OTP in terminal

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("❌ Send OTP error:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// Verify OTP and login user
exports.verifyOtp = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const record = await Otp.findOne({ email });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP valid - create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username,
        organizationName: user.organizationName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );
console.log(`🔐 OTP for ${userEmail}: ${otpCode}`);


    // Delete OTP record after successful login
    await Otp.deleteOne({ email });

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
