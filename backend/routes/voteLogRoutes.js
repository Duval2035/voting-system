// backend/routes/voteLogRoutes.js
const express = require("express");
const router = express.Router();
const VoteLog = require("../models/VoteLog");
const authMiddleware = require("../middleware/authMiddleware");
const { Parser } = require("json2csv");

// ✅ GET vote logs for specific election
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

// ✅ CSV Export route
router.get("/export/:electionId", authMiddleware, async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId })
      .populate("user", "username email");

    const formatted = logs.map((log) => ({
      username: log.user?.username || "N/A",
      email: log.user?.email || "N/A",
      timestamp: log.timestamp,
      hash: log.hash,
    }));

    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment(`vote_logs_${req.params.electionId}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
});

module.exports = router;
