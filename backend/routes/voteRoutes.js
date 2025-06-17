const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");
const authenticateUser = require("../middleware/authenticateUser");
const voteController = require("../controllers/voteController");

// GET /api/votes/results/:electionId – Election results
router.get("/results/:electionId", voteController.getElectionResults);

// POST /api/votes – Submit a vote
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { electionId, candidateId, name, email } = req.body;

    // Validate required fields
    if (!electionId || !candidateId || !name || !email) {
      return res.status(400).json({ message: "Missing required vote information." });
    }

    // Prevent double voting in the same election
    const existingVote = await Vote.findOne({
      user: req.user.userId,
      election: electionId,
    });

    if (existingVote) {
      return res.status(400).json({ message: "You have already voted in this election." });
    }

    // Save new vote
    const vote = new Vote({
      user: req.user.userId,
      election: electionId,
      candidate: candidateId,
      name,
      email,
    });

    await vote.save();

    res.status(201).json({ message: "✅ Vote cast successfully" });
  } catch (err) {
    console.error("❌ Error casting vote:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
