const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getVoteLogs,
  exportVoteLogsCSV
} = require("../controllers/voteController");

// ✅ Export logs as CSV (more specific route first)
router.get("/export/:electionId", authMiddleware, exportVoteLogsCSV);

// ✅ Get vote logs for a specific election
router.get("/:electionId", authMiddleware, getVoteLogs);

module.exports = router;
