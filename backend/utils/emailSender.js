const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
      user:"armelduvalkenmoe@gmail.com", 
      pass:"erejhakxumucoswj",  
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"Voting System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
