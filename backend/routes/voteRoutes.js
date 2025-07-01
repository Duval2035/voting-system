const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const voteController = require("../controllers/voteController");
const blockchainVoteController = require("../controllers/blockchainVoteController");
const adminController = require("../controllers/adminController");
const { getBlockchainResultsByElection } = require("../controllers/blockchainResultsController");

// Submit vote (requires auth)
router.post("/votes", authMiddleware, voteController.submitVote);

// Get vote logs for an election (requires auth)
router.get("/:electionId/logs", authMiddleware, voteController.getVoteLogs);

// Export vote logs CSV (requires auth)
router.get("/:electionId/export", authMiddleware, voteController.exportVoteLogsCSV);

// Get placeholder election results (public)
router.get("/:electionId/results", voteController.getResults);

// Get detailed election results by electionId (public)
router.get("/results/:electionId", voteController.getElectionResults);

// Get all votes by election (requires auth)
router.get("/votes/:electionId", authMiddleware, voteController.getVotesByElection);

// Blockchain vote casting separately
router.post("/cast", blockchainVoteController.castVoteOnBlockchain);

// Admin route: assign all users to election
router.post("/admin/election/:electionId/assign-all", adminController.assignAllUsersToElection);

// Blockchain results by election
router.get("/blockchain-results/:electionId", getBlockchainResultsByElection);

module.exports = router;
