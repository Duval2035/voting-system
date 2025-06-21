// controllers/messageController.js
const User = require("../models/User");
const MessageLog = require("../models/MessageLog");
const sendEmail = require("../utils/emailSender");
const Message = require("../models/Message");

// sendMessage controller
exports.sendMessage = async (req, res) => {
  const { subject, content, recipients } = req.body;

  if (!subject || !content || !recipients || recipients.length === 0) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  console.log(`✉️ Sending message to ${recipients.length} recipients`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${content}`);

  try {
    // Send email to each recipient
    for (const email of recipients) {
      await sendEmail(email, subject, content);
    }

    // Log message in DB
    await MessageLog.create({
      subject,
      content,
      recipients,
      sender: req.user?.id || null, // If you use authentication
    });

    res.status(200).json({ message: "✅ Messages sent!" });
  } catch (err) {
    console.error("❌ Error sending emails:", err);
    res.status(500).json({ message: "Failed to send emails." });
  }
};

// Get message history controller
exports.getMessageHistory = async (req, res) => {
  try {
    const messages = await MessageLog.find()
      .sort({ sentAt: -1 })
      .limit(50); // Limit for performance
    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching message history:", err);
    res.status(500).json({ message: "Failed to fetch message history." });
  }
};