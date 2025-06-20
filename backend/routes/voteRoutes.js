const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  submitVote,
  getVoteLogs,
  exportVoteLogsCSV,
  getResults,
  getCandidateResults,
  getVotesByElection,
  getElectionResults,
} = require("../controllers/voteController");

// 🗳️ Vote submission
router.post("/", authMiddleware, submitVote);

// 📥 Logs
router.get("/:electionId/logs", authMiddleware, getVoteLogs);

// 📤 CSV Export
router.get("/:electionId/export", authMiddleware, exportVoteLogsCSV);

// 📊 Results
router.get("/results/:electionId", getElectionResults);
router.get("/candidate/:id", authMiddleware, getCandidateResults);

// 📋 All Votes
router.get("/votes/:electionId", authMiddleware, getVotesByElection);

module.exports = router;
