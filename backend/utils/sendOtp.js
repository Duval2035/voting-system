const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const sendOtp = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:"armelduvalkenmoe@gmail.com", 
      pass:"erejhakxumucoswj",  
    },
  });

  const mailOptions = {
    from: `"Voting System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <p>Hello,</p>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code is valid for 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtp, generateOTP };

     