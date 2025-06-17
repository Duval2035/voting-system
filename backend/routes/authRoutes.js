const express = require("express");
const router = express.Router();
const { registerUser, sendOtp, verifyOtp } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
