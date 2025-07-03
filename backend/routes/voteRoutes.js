const express = require("express");
const router = express.Router();
const { protectUser } = require("../middleware/authMiddleware");
const voteController = require("../controllers/voteController");

// ✅ Most specific routes first
router.get("/election/:electionId", protectUser, voteController.getVotesByElection);

// Submit vote (requires user auth)
router.post("/", protectUser, voteController.submitVote);

// Get vote logs for an election (requires user auth)
router.get("/:electionId/logs", protectUser, voteController.getVoteLogs);

// Export vote logs CSV (requires user auth)
router.get("/:electionId/export", protectUser, voteController.exportVoteLogsCSV);

// Get results (public)
router.get("/:electionId/results", voteController.getResults);

module.exports = router;
