const express = require("express");
const router = express.Router();
const { protectUser } = require("../middleware/authMiddleware");
const voteController = require("../controllers/voteController");

// Get votes by election (placeholder)
router.get("/election/:electionId", protectUser, voteController.getVotesByElection);

// Submit a vote (protected)
router.post("/", protectUser, voteController.submitVote);

// Get vote logs for an election (protected)
router.get("/:electionId/logs", protectUser, voteController.getVoteLogs);

// Export vote logs CSV (protected)
router.get("/:electionId/export", protectUser, voteController.exportVoteLogsCSV);

// Get election results (public, no auth)
router.get("/:electionId/results", voteController.getResults);

module.exports = router;
