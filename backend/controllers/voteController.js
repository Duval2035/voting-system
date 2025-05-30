// backend/controllers/voteController.js
const Vote = require("../models/Vote");

exports.submitVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user.userId;

  try {
    const existing = await Vote.findOne({ election: electionId, user: userId });
    if (existing) {
      return res.status(400).json({ message: "You already voted in this election." });
    }

    const vote = new Vote({ election: electionId, candidate: candidateId, user: userId });
    await vote.save();

    res.status(200).json({ message: "Vote submitted successfully." });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Failed to submit vote." });
  }
};
exports.getVotesByElection = async (req, res) => {
  const electionId = req.params.electionId;

  try {
    const votes = await Vote.find({ election: electionId }).populate("candidate");
    res.status(200).json(votes);
  } catch (err) {
    console.error("Get votes error:", err);
    res.status(500).json({ message: "Failed to fetch votes." });
  }
};