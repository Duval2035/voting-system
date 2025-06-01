// controllers/voteController.js
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");

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
exports.getResults = async (req, res) => {
  try {
    const electionId = req.params.id;

    const votes = await Vote.find({ election: electionId }).populate("candidate");

    const tally = {};

    for (const vote of votes) {
      const candidateId = vote.candidate._id.toString();
      if (!tally[candidateId]) {
        tally[candidateId] = {
          _id: vote.candidate._id,
          name: vote.candidate.name,
          position: vote.candidate.position,
          image: vote.candidate.image,
          votes: 1,
        };
      } else {
        tally[candidateId].votes++;
      }
    }

    res.json(Object.values(tally));
  } catch (err) {
    console.error("Failed to fetch results:", err);
    res.status(500).json({ message: "Error fetching results" });
  }
};