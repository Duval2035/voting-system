const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// 📌 Register user
router.post("/register", authController.register);

// 📤 Send OTP
router.post("/send-otp", authController.sendOtpToEmail);

// ✅ Verify OTP and login
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
