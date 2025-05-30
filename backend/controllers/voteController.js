// controllers/voteController.js
const Vote = require("../models/Vote");

exports.submitVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user.userId;

  try {
    // Check for duplicate vote
    const alreadyVoted = await Vote.findOne({ election: electionId, user: userId });
    if (alreadyVoted) {
      return res.status(400).json({ message: "You already voted in this election." });
    }

    const vote = new Vote({
      election: electionId,
      candidate: candidateId,
      user: userId,
    });

    await vote.save();

    res.status(200).json({ message: "Vote submitted successfully." });
  } catch (error) {
    console.error("Vote submission error:", error);
    res.status(500).json({ message: "Failed to submit vote." });
  }
};

exports.getVotesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const votes = await Vote.find({ election: electionId }).populate("candidate").populate("user");
    res.status(200).json(votes);
  } catch (error) {
    console.error("Fetch votes error:", error);
    res.status(500).json({ message: "Failed to fetch votes." });
  }
};
