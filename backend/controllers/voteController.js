const mongoose = require("mongoose");
const crypto = require("crypto");
const Voter = require("../models/Voter");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const VoteLog = require("../models/VoteLog");
const { contract } = require("../blockchain/contractService");

exports.submitVote = async (req, res) => {
  let { electionId, candidateId } = req.body;
  const userId = req.user?._id;
  const email = req.user?.email;

  if (!userId || !email) {
    return res.status(401).json({ message: "Unauthorized: Missing user info" });
  }

  if (!mongoose.Types.ObjectId.isValid(candidateId) || !mongoose.Types.ObjectId.isValid(electionId)) {
    return res.status(400).json({ message: "Invalid candidate or election ID format" });
  }

  electionId = electionId.toString();

  try {
    console.log("🧾 Incoming vote:", { userId, email, electionId, candidateId });

    const candidate = await Candidate.findById(candidateId).select("+election");
    if (!candidate || candidate.election.toString() !== electionId) {
      return res.status(404).json({ message: "Candidate not found or not part of this election" });
    }

    if (candidate.blockchainId === undefined || candidate.blockchainId === null) {
      return res.status(500).json({ message: "Candidate is missing blockchain ID" });
    }

    // Check or create voter
    let voter = await Voter.findOne({ email, election: electionId });
    if (!voter) {
      voter = new Voter({
        email,
        election: electionId,
        name: req.user.username || "Unknown",
      });
      await voter.save();
    }

    // Prevent double voting
    const alreadyVoted = await Vote.findOne({ election: electionId, user: userId });
    if (alreadyVoted) {
      return res.status(409).json({ message: "You have already voted in this election." });
    }

    // Save vote
    const vote = new Vote({
      election: electionId,
      candidate: candidate._id,
      user: userId,
    });
    await vote.save();

    console.log("📤 Sending vote to blockchain:", {
      blockchainId: candidate.blockchainId,
      electionId,
    });

    const tx = await contract.vote(Number(candidate.blockchainId), String(electionId));
    await tx.wait();

    // Generate vote hash for logging
    const timestamp = new Date();
    const hash = crypto
      .createHash("sha256")
      .update(`${userId}-${electionId}-${candidate.blockchainId}-${timestamp.toISOString()}`)
      .digest("hex");

    const log = new VoteLog({
      user: userId,
      election: electionId,
      timestamp,
      hash,
    });
    await log.save();

    return res.status(200).json({ message: "✅ Vote submitted and stored on blockchain" });
  } catch (error) {
    console.error("❌ submitVote error:", error);
    return res.status(500).json({ message: "Server error during vote submission" });
  }
};

// Placeholder for future implementation
exports.getResults = async (req, res) => {
  res.status(200).json({ message: "📊 Results placeholder" });
};

exports.getCandidateResults = async (req, res) => {
  res.status(200).json({ message: "📊 Candidate Results placeholder" });
};

// Fetch all vote logs for an election
exports.getVoteLogs = async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId }).populate("user", "username");
    res.status(200).json(logs);
  } catch (err) {
    console.error("❌ getVoteLogs error:", err);
    res.status(500).json({ message: "Failed to fetch vote logs." });
  }
};

// Placeholder: export CSV
exports.exportVoteLogsCSV = async (req, res) => {
  res.status(200).json({ message: "📤 CSV export placeholder" });
};

// Placeholder: fetch votes by election
exports.getVotesByElection = async (req, res) => {
  res.status(200).json({ message: "📋 Votes by election placeholder" });
};

// Tally votes for each candidate in the election
exports.getElectionResults = async (req, res) => {
  const { electionId } = req.params;

  try {
    const candidates = await Candidate.find({ election: electionId });

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const voteCount = await Vote.countDocuments({ candidate: candidate._id });
        return {
          _id: candidate._id,
          name: candidate.name,
          position: candidate.position,
          image: candidate.image || "/default-user.png",
          voteCount,
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ getElectionResults error:", error);
    res.status(500).json({ message: "Failed to fetch election results." });
  }
};

// Get vote logs by election
exports.getVoteLogsByElection = async (req, res) => {
  const { electionId } = req.params;

  try {
    const logs = await VoteLog.find({ election: electionId }).populate("user", "username");
    res.status(200).json(logs);
  } catch (error) {
    console.error("❌ getVoteLogsByElection error:", error);
    res.status(500).json({ message: "Failed to fetch vote logs." });
  }
};
