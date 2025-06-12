const express = require("express");
const router = express.Router();
const { submitVote, getResults } = require("../controllers/voteController");
const authMiddleware = require("../middleware/authMiddleware");
const VoteLog = require("../models/VoteLog");

// GET all logs for an election (auditor only)
router.post("/", authMiddleware, submitVote);
router.get("/results/:id", getResults);
const {
  getCandidateResults,
  getVotesByElection,
} = require("../controllers/voteController");

router.get("/:electionId", authMiddleware, async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId })
      .populate("user", "username email")
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (err) {
    console.error("Vote log fetch error:", err);
    res.status(500).json({ message: "Error fetching vote logs" });
  }
});

module.exports = router;
