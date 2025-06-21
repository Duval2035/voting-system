const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message");
const authenticateAdmin = require("../middleware/authenticateAdmin");
const { sendMessage, getMessageHistory } = require("../controllers/messageController");

// Send message to specific users

router.get("/history", authenticateAdmin, getMessageHistory);

router.post("/send", authenticateAdmin, sendMessage);
router.post("/send", authenticateAdmin, async (req, res) => {
  const { subject, content, recipients } = req.body;

  if (!subject || !content || !recipients || !Array.isArray(recipients)) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Get users by email
    const users = await User.find({ email: { $in: recipients } });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for provided emails." });
    }

    // Optionally store the message (could be extended)
  
    await Message.create({ election: electionId, content: message, sentAt: new Date() });
    // Simulate message delivery
    console.log(`📨 Message sent to ${users.length} users.`);

    res.json({ message: "✅ Message sent successfully." });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "❌ Error sending message." });
  }
});

module.exports = router;
