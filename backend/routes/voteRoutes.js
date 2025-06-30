// backend/routes/voteRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const voteController = require("../controllers/voteController");
const blockchainVoteController = require("../controllers/blockchainVoteController");
const adminController = require("../controllers/adminController");
const { getBlockchainResultsByElection } = require("../controllers/blockchainResultsController");

// 🗳️ Submit vote
router.post("/", auth, voteController.submitVote);

// 📥 Vote logs
router.get("/:electionId/logs", auth, voteController.getVoteLogs);

// 📤 Export logs as CSV
router.get("/:electionId/export", auth, voteController.exportVoteLogsCSV);

// 📊 Election results
router.get("/:electionId/results", voteController.getResults);
router.get("/results/:electionId", voteController.getElectionResults);

// 📋 All votes in an election
router.get("/votes/:electionId", auth, voteController.getVotesByElection);

// ⛓️ Blockchain vote casting (if needed separately)
router.post("/cast", blockchainVoteController.castVoteOnBlockchain);

// 🛠️ Admin: Assign all users to election
router.post("/admin/election/:electionId/assign-all", adminController.assignAllUsersToElection);

// 🗳️ Blockchain results by election
router.get("/blockchain-results/:electionId", getBlockchainResultsByElection);


module.exports = router;