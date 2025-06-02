// controllers/voteController.js
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const VoteLog = require("../models/VoteLog"); 

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
const timestamp = new Date();
const hashString = `${userId}-${electionId}-${candidateId}-${timestamp.toISOString()}`;
const hash = crypto.createHash("sha256").update(hashString).digest("hex");

const log = new VoteLog({
  user: userId,
  election: electionId,
  timestamp,
  hash
});
await log.save();
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
exports.getCandidateResults = async (req, res) => {
  const userId = req.params.id;

  try {
    const candidate = await Candidate.findOne({ userId });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const votes = await Vote.find({ candidate: candidate._id });

    res.json({
      _id: candidate._id,
      name: candidate.name,
      position: candidate.position,
      image: candidate.image,
      votes: votes.length,
    });
  } catch (err) {
    console.error("Candidate result error:", err);
    res.status(500).json({ message: "Error fetching candidate results" });
  }
};


exports.getCandidateResults = async (req, res) => {
  const userId = req.params.id;

  try {
    const candidate = await Candidate.findOne({ userId });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const votes = await Vote.find({ candidate: candidate._id });

    res.json({
      _id: candidate._id,
      name: candidate.name,
      position: candidate.position,
      image: candidate.image,
      votes: votes.length,
    });
  } catch (err) {
    console.error("Candidate result error:", err);
    res.status(500).json({ message: "Error fetching candidate results" });
  }
};