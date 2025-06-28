const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getVoteLogs,
  exportVoteLogsCSV,
} = require("../controllers/voteController");

// More specific route first
router.get("/export/:electionId", authMiddleware, exportVoteLogsCSV);

// Get vote logs for a specific election, always return JSON array (never 204 or empty)
router.get("/:electionId", authMiddleware, async (req, res) => {
  try {
    const logs = await getVoteLogs(req.params.electionId);
    if (!logs) {
      return res.json([]);
    }
    res.json(logs);
  } catch (error) {
    console.error("Error fetching vote logs:", error);
    res.status(500).json({ message: "Server error fetching vote logs." });
  }
});

module.exports = router;
