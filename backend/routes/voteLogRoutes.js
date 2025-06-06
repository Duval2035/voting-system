const express = require("express");
const router = express.Router();
const VoteLog = require("../models/VoteLog");
const { Parser } = require("json2csv");
const authMiddleware = require("../middleware/authMiddleware");
const { getVoteLogs, exportVoteLogsCSV } = require("../controllers/voteController");

const { exportLogsToCSV } = require("../controllers/voteLogController");

// CSV Export Endpoint
router.get("/:electionId", authMiddleware, getVoteLogs);
router.get("/", authMiddleware, getVoteLogs);
router.get("/export/:electionId", authMiddleware, exportLogsToCSV);

router.get("/export", authMiddleware, exportLogsToCSV);
router.get("/export", authMiddleware, async (req, res) => {
  try {
    const logs = await VoteLog.find({})
      .populate("user", "username email")
      .populate("election", "title")
      .sort({ timestamp: -1 });

    if (logs.length === 0) {
      return res.status(404).json({ message: "No vote logs to export" });
    }

    const exportData = logs.map((log) => ({
      Username: log.user?.username || "N/A",
      Email: log.user?.email || "N/A",
      Election: log.election?.title || "N/A",
      Timestamp: new Date(log.timestamp).toLocaleString(),
      Hash: log.hash,
    }));

    const parser = new Parser();
    const csv = parser.parse(exportData);

    res.header("Content-Type", "text/csv");
    res.attachment("vote-logs.csv");
    return res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    return res.status(500).json({ message: "Failed to export CSV" });
  }
});

module.exports = router;

