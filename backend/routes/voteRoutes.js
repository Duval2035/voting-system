const express = require("express");
const router = express.Router();
const { submitVote, getResults } = require("../controllers/voteController");
const authMiddleware = require("../middleware/authMiddleware");
const VoteLog = require("../models/VoteLog");
const Voter = require("../models/User"); 
const Election = require("../models/Election");

// GET all logs for an election (auditor only)
router.post("/", authMiddleware, submitVote);
router.get("/results/:id", getResults);
const {
  getCandidateResults,
  getVotesByElection,
} = require("../controllers/voteController");

// Get all voters associated with an election
router.get("/by-election/:electionId", authMiddleware, async (req, res) => {
  try {
  
const logs = await VoteLog.find({ election: req.params.electionId })
      .populate("user", "username email")
      .sort({ timestamp: -1 });
    // You may need to change this depending on your schema
    

    res.status(200).json(election.voters || []);
  } catch (err) {
    console.error("❌ Error fetching voters:", err);
    res.status(500).json({ message: "Failed to fetch voters" });
  }
});


module.exports = router;
