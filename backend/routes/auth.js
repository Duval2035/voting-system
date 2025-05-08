const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

const router = express.Router();

// Validation schema for registration and login
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// User Registration Route
router.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).send('User already exists');

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ name, email, password: hashedPassword });
  try {
    const savedUser = await newUser.save();
    res.status(201).send({
      message: 'User created successfully',
      user: savedUser,
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// User Login Route
router.post('/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Invalid email or password');

  // Compare passwords
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password');

  // Generate JWT token
  const token = jwt.sign({ _id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

  res.status(200).send({ message: 'Logged in successfully', token });
});

module.exports = router;
