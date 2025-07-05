const express = require("express");
const router = express.Router();
const { protectUser } = require("../middleware/authMiddleware"); // ✅ correct import

const {
  submitVote,
  getResults,
  getVoteLogs,
  getVotesByElection,
  exportVoteLogsCSV,
} = require("../controllers/voteController");

// 🗳️ Submit a vote (authentication required)
router.post("/", protectUser, submitVote); // ✅ FIXED

// 📊 Get election results (public)
router.get("/results/:electionId", getResults);

// 🧾 View audit logs (authentication required)
router.get("/logs/:electionId", protectUser, getVoteLogs);

// 📋 View all votes in an election (authentication required)
router.get("/election/:electionId", protectUser, getVotesByElection);

// 📤 Export CSV (authentication required, placeholder)
router.get("/export/:electionId", protectUser, exportVoteLogsCSV);

module.exports = router;
