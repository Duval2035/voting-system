
const express = require("express");
const router = express.Router();
const { getBlockchainResultsByElection } = require("../controllers/blockchainResultsController");

router.get("/:electionId", getBlockchainResultsByElection);
router.get("/blockchain-results/:electionId", getBlockchainResultsByElection);

module.exports = router;
