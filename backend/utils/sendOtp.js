const nodemailer = require("nodemailer");
const User = require("../models/User");

const sendOtp = async (req, res) => {
  const { email } = req.body;

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  // Setup mail transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
       user:"armelduvalkenmoe@gmail.com", 
      pass:"erejhakxumucoswj",  

    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
  };

  
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("❌ Failed to send email:", err);
      return res.status(500).json({ message: "Failed to send OTP email" });
    } else {
      console.log("✅ OTP email sent:", info.response);
      res.status(200).json({ message: "OTP sent to your email" });
    }
  });
};

module.exports = sendOtp;
   