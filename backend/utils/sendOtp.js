
const nodemailer = require('nodemailer');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOtp = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:"armelduvalkenmoe@gmail.com",  // Must be set in .env
      pass:"erejhakxumucoswj",   // App password only
    }
  });

  const mailOptions = {
    from: `"Voting System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtp, generateOTP };
