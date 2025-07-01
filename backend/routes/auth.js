const express = require("express");
const Joi = require("joi");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// Registration schema with conditional electionId validation
const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  organizationName: Joi.string().allow(""),
  role: Joi.string().valid("admin", "user", "auditor", "candidate").default("user"),
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

// Validation middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Register route
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    let { username, email, password, organizationName, role, electionId } = req.body;
    email = email.trim().toLowerCase();

    // Ignore electionId if role is not candidate
    if (role !== "candidate") {
      electionId = undefined;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

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
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
