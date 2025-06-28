const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// GET /api/messages/history
router.get("/history", authenticateAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ sentAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching message history:", err);
    res.status(500).json({ message: "Server error fetching message history" });
  }
});


// ✅ POST send message to recipients
router.post("/send", authenticateAdmin, async (req, res) => {
  const { subject, content, recipients } = req.body;

  if (!subject || !content || !recipients || !Array.isArray(recipients)) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const users = await User.find({ email: { $in: recipients } });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for provided emails." });
    }

    const newMessage = new Message({
      subject,
      content,
      recipients,
      sentBy: req.user.id,
    });

    await newMessage.save();

    console.log(`📨 Message sent to ${users.length} user(s).`);
    res.json({ message: "✅ Message sent successfully." });
  } catch (err) {
    console.error("❌ Send message error:", err);
    res.status(500).json({ message: "Error sending message." });
  }
});

module.exports = router;
