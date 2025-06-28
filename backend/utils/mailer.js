const nodemailer = require("nodemailer");

exports.generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Voting System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
