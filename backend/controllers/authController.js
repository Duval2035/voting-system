const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { generateOTP, sendOtp } = require("../utils/sendOtp");

// ✅ Register User
exports.register = async (req, res) => {
  try {
    const { username, email, password, organizationName, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const newUser = new User({ username, email, password, organizationName, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Send OTP to Email
exports.sendOtpToEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtp(email, otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ✅ Verify OTP and Login
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      !user.otp ||
      user.otp !== otp ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        isAdmin: user.role === "admin",
        organizationName: user.organizationName,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
