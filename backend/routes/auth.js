const express = require("express");
const Joi = require("joi");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  register,
  sendOtp,
  verifyOtp,
} = require("../controllers/authController");

const router = express.Router();


// ✅ Validation Middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error)
    return res.status(400).json({ message: error.details[0].message });
  next();
};


// ✅ Joi Schemas
const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  organizationName: Joi.string().allow(""),
  role: Joi.string()
    .valid("admin", "user", "auditor", "candidate")
    .default("user"),
});

const emailSchema = Joi.object({ email: Joi.string().email().required() });
const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});


// ✅ Auth Routes
router.post("/register", validate(registerSchema), register);
router.post("/send-otp", validate(emailSchema), sendOtp);
router.post("/verify-otp", validate(otpSchema), verifyOtp);

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
   



