const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOtp } = require('../utils/sendOtp');

// 🔐 Registration (no OTP here)
exports.register = async (req, res) => {
  const { username, email, password, organizationName, role } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email: normalizedEmail,
      password: hashed,
      organizationName,
      role,
    });

    const saved = await newUser.save();

   const token = jwt.sign({
  userId: saved._id,
  role: saved.role,
  organizationName: saved.organizationName // ✅ include this!
}, 'secret', { expiresIn: '1d' });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: saved._id,
        username: saved.username,
        email: saved.email,
        role: saved.role,
        organizationName: saved.organizationName,
      },
      token,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// 📤 Send OTP for login
exports.sendOtpToEmail = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otpCode = generateOTP();

    await Otp.findOneAndDelete({ email });
    await Otp.create({ email, otp: otpCode });
    await sendOtp(email, otpCode);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// ✅ Verify OTP & Login
exports.verifyOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { otp } = req.body;

  try {
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: 'Invalid OTP' });

    await Otp.deleteOne({ _id: record._id });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

  const token = jwt.sign({
  userId: user._id,
  role: user.role,
  organizationName: user.organizationName // ✅
}, 'secret', { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful',
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
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};
