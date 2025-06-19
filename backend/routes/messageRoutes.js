
const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Message = require("../models/Message");
const authenticateAdmin = require("../middleware/authenticateAdmin");

router.post("/send", authenticateAdmin, async (req, res) => {
  const { electionId, message } = req.body;
  if (!electionId || !message) {
    return res.status(400).json({ message: "Missing fields." });
  }

  try {
    const voters = await Voter.find({ election: electionId });
    if (voters.length === 0) {
      return res.status(404).json({ message: "No voters found." });
    }

    // Save message in DB (optional)
    await Message.create({ election: electionId, content: message, sentAt: new Date() });

    // In a real app, send via email/SMS/etc.
    console.log(`Sending message to ${voters.length} voters`);

    res.json({ message: "Message sent successfully." });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Error sending message." });
  }
});

module.exports = router;
