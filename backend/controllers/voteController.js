const mongoose = require("mongoose");
const crypto = require("crypto");
const Voter = require("../models/Voter");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const VoteLog = require("../models/VoteLog");
const { contract } = require("../blockchain/contractService");

exports.submitVote = async (req, res) => {
  const { electionId, candidateId, email } = req.body;
  const userId = req.user?._id;

  try {
    // ✅ Validate candidate
    const candidate = await Candidate.findOne({ blockchainId: candidateId, election: electionId });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    // ✅ Ensure voter exists
    let voter = await Voter.findOne({ email, election: electionId });
    if (!voter) {
      voter = new Voter({
        email,
        election: electionId,
        name: req.user.username || "Unknown",
      });
      await voter.save();
    }

    // ❌ Prevent double voting
    const alreadyVoted = await Vote.findOne({ election: electionId, user: userId });
    if (alreadyVoted) return res.status(409).json({ message: "Already voted" });

    // ✅ Save MongoDB vote
    const vote = new Vote({
      election: electionId,
      candidate: candidate._id,
      user: userId,
    });
    await vote.save();

    // ✅ Blockchain vote (stringify electionId)
    const tx = await contract.vote(Number(candidate.blockchainId), electionId.toString());
     await tx.wait();

    // ✅ Log for audit
    const timestamp = new Date();
    const hash = crypto
      .createHash("sha256")
      .update(`${userId}-${electionId}-${candidateId}-${timestamp.toISOString()}`)
      .digest("hex");

    const log = new VoteLog({
      user: userId,
      election: electionId,
      timestamp,
      hash,
    });
    await log.save();

    res.status(200).json({ message: "✅ Vote submitted and stored on blockchain" });
  } catch (error) {
    console.error("❌ submitVote error:", error);
    res.status(500).json({ message: "Server error during vote submission" });
  }
};

// Placeholder implementations for other routes to avoid crashing
exports.getResults = async (req, res) => {
  res.status(200).json({ message: "📊 Results placeholder" });
};

exports.getCandidateResults = async (req, res) => {
  res.status(200).json({ message: "📊 Candidate Results placeholder" });
};

exports.getVoteLogs = async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId }).populate("user", "username");
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vote logs." });
  }
};

exports.exportVoteLogsCSV = async (req, res) => {
  res.status(200).json({ message: "📤 CSV export placeholder" });
};

exports.getVotesByElection = async (req, res) => {
  res.status(200).json({ message: "📋 Votes by election placeholder" });
};

exports.getElectionResults = async (req, res) => {
  const { electionId } = req.params;

  try {
    const candidates = await Candidate.find({ election: electionId });

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const count = await Vote.countDocuments({ candidate: candidate._id });
        return {
          _id: candidate._id,
          name: candidate.name,
          position: candidate.position,
          image: candidate.image || "/default-user.png",
          voteCount: count,
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ DB results fetch error:", error);
    res.status(500).json({ message: "Failed to fetch election results." });
  }
};


