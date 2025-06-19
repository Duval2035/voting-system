const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");
const authenticateUser = require("../middleware/authenticateUser");
const authMiddleware = require("../middleware/authenticateUser"); // just to keep naming consistent
const {
  getVoteLogs,
  exportVoteLogsCSV,
  submitVote,
  getResults,
  getCandidateResults,
  getVotesByElection,
  getElectionResults,
} = require("../controllers/voteController");


// GET /api/votes/results/:electionId – Aggregated election results
router.get("/results/:electionId", getElectionResults);

// GET /api/votes/:electionId – Get vote logs for an election (protected)
router.get("/:electionId", authMiddleware, getVoteLogs);

// GET /api/votes/export/:electionId – Export vote logs as CSV (protected)
router.get("/export/:electionId", authMiddleware, exportVoteLogsCSV);

// POST /api/votes/submit – Submit a vote (protected)
router.post("/submit", authenticateUser, submitVote);

// Optional: Get all votes by election with user info (if needed)
router.get("/votes/:electionId", authMiddleware, getVotesByElection);

// Optional: Get candidate-specific results by user ID (if needed)
router.get("/candidate/:id", authMiddleware, getCandidateResults);

module.exports = router;
