const express = require("express");
const router = express.Router();
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");
const voteController = require("../controllers/voteController");
const blockchainVoteController = require("../controllers/blockchainVoteController");
const adminController = require("../controllers/adminController");
const { getBlockchainResultsByElection } = require("../controllers/blockchainResultsController");

console.log("voteController:", voteController);
console.log("protectUser:", protectUser);
console.log("protectAdmin:", protectAdmin);
console.log("submitVote:", voteController.submitVote);

// Submit vote (requires user auth)
router.post("/votes", protectUser, voteController.submitVote);

// Get vote logs for an election (requires user auth)
router.get("/:electionId/logs", protectUser, voteController.getVoteLogs);

// Export vote logs CSV (requires user auth)
router.get("/:electionId/export", protectUser, voteController.exportVoteLogsCSV);

// Get placeholder election results (public)
router.get("/:electionId/results", voteController.getResults);

// Get detailed election results by electionId (public)
router.get("/results/:electionId", voteController.getElectionResults);

// Get all votes by election (requires user auth)
router.get("/votes/:electionId", protectUser, voteController.getVotesByElection);

// Blockchain vote casting separately (public or protected? adjust if needed)
router.post("/cast", blockchainVoteController.castVoteOnBlockchain);

// Admin route: assign all users to election (requires admin auth)
router.post("/admin/election/:electionId/assign-all", protectAdmin, adminController.assignAllUsersToElection);

// Blockchain results by election (public or protected? adjust if needed)
router.get("/blockchain-results/:electionId", getBlockchainResultsByElection);

module.exports = router;
