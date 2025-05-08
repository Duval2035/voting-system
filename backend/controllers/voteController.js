// backend/controllers/voteController.js
const Vote = require('../models/Vote');

exports.submitVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    const vote = new Vote({
      userId: req.user.id,
      electionId,
      candidateId
    });

    await vote.save();
    res.status(201).json({ message: "Vote submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error submitting vote" });
  }
};

exports.getVotesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const votes = await Vote.find({ electionId });
    res.status(200).json(votes);
  } catch (error) {
    res.status(500).json({ error: "Error fetching votes" });
  }
};
