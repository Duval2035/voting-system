// backend/routes/voteLogRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const VoteLog = require("../models/VoteLog");
const { Parser } = require("json2csv");

// 📜 GET all logs for an election
router.get("/:electionId", authMiddleware, async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId })
      .populate("user", "username email")
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (err) {
    console.error("Vote log fetch error:", err);
    res.status(500).json({ message: "Error fetching vote logs" });
  }
});

// 📁 Export logs to CSV
router.get("/export/:electionId", authMiddleware, async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId }).populate("user", "username email");

    if (!logs.length) {
      return res.status(404).json({ message: "No logs found" });
    }

    const formattedLogs = logs.map(log => ({
      username: log.user?.username || "Unknown",
      email: log.user?.email || "Unknown",
      timestamp: log.timestamp,
      hash: log.hash
    }));

    const parser = new Parser({ fields: ["username", "email", "timestamp", "hash"] });
    const csv = parser.parse(formattedLogs);

    res.header("Content-Type", "text/csv");
    res.attachment("vote_logs.csv");
    return res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).send("Failed to export CSV");
  }
});

module.exports = router;
