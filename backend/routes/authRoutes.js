// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/send-otp", authController.sendOtpToEmail);
router.post("/verify-otp", authController.verifyOtpLogin);

module.exports = router;
