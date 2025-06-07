// backend/routes/voteLogRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getVoteLogs,
  exportVoteLogsCSV
} = require("../controllers/voteController");

// ✅ Get vote logs for an election
router.get("/:electionId", authMiddleware, getVoteLogs);

// ✅ Export logs as CSV
router.get("/export/:electionId", authMiddleware, exportVoteLogsCSV);

module.exports = router;
