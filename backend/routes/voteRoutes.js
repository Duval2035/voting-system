// routes/voteRoutes.js
const express = require("express");
const router = express.Router();
const { submitVote, getVotesByElection } = require("../controllers/voteController");
const authMiddleware = require("../middleware/authMiddleware");

// Submit vote
router.post("/", authMiddleware, submitVote);

// View all votes for an election
router.get("/:electionId", authMiddleware, getVotesByElection);

module.exports = router;
