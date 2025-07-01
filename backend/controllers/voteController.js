const mongoose = require("mongoose");
const crypto = require("crypto");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const VoteLog = require("../models/VoteLog");
const contract = require("../utils/blockchain"); // ethers contract instance

exports.submitVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user?._id;
  const userEmail = req.user?.email || "unknown";

  console.log("🧾 Incoming vote:", { userId, userEmail, electionId, candidateId });

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No user info found" });
  }

  if (!mongoose.Types.ObjectId.isValid(electionId) || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.status(400).json({ message: "Invalid election or candidate ID" });
  }

  try {
    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found in this election" });
    }

    const alreadyVoted = await Vote.findOne({ election: electionId, user: userId });
    if (alreadyVoted) {
      return res.status(409).json({ message: "You have already voted in this election." });
    }

    if (!candidate.blockchainId) {
      return res.status(400).json({ message: "Candidate blockchainId missing" });
    }

    // Cast vote on blockchain
    try {
      console.log("🔗 Casting vote on-chain for blockchainId:", candidate.blockchainId);
      const tx = await contract.vote(Number(candidate.blockchainId));
      console.log("⛓️ Blockchain tx hash:", tx.hash);
      await tx.wait();
      console.log("✅ Blockchain vote confirmed.");
    } catch (blockchainError) {
      console.error("❌ Blockchain vote error:", blockchainError);
      return res.status(500).json({
        message: "Blockchain transaction failed",
        error: blockchainError.message,
      });
    }

    // Save vote locally
    const vote = new Vote({ election: electionId, candidate: candidate._id, user: userId });
    await vote.save();

    // Log vote hash
    const timestamp = new Date();
    const hash = crypto
      .createHash("sha256")
      .update(`${userId}-${electionId}-${candidate.blockchainId}-${timestamp.toISOString()}`)
      .digest("hex");

    const log = new VoteLog({ user: userId, election: electionId, timestamp, hash });
    await log.save();

    return res.status(200).json({ message: "✅ Vote successfully submitted and recorded on blockchain" });
  } catch (err) {
    console.error("❌ submitVote error:", err);
    return res.status(500).json({
      message: "Server error during vote submission",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

exports.getResults = async (req, res) => {
  res.status(200).json({ message: "📊 Results placeholder" });
};

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

exports.getVoteLogs = async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId }).populate("user", "username");
    res.status(200).json(logs);
  } catch (err) {
    console.error("❌ getVoteLogs error:", err);
    res.status(500).json({ message: "Failed to fetch vote logs." });
  }
};

exports.exportVoteLogsCSV = async (req, res) => {
  res.status(200).json({ message: "📤 CSV export placeholder" });
};

exports.getVotesByElection = async (req, res) => {
  res.status(200).json({ message: "📋 Votes by election placeholder" });
};

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
// Placeholder for exporting vote logs as CSV
exports.exportVoteLogsCSV = async (req, res) => {
  res.status(200).json({ message: "📤 CSV export placeholder" });
};

// Placeholder for fetching all votes by election
exports.getVotesByElection = async (req, res) => {
  res.status(200).json({ message: "📋 Votes by election placeholder" });
};

// 📊 Get tally of votes per candidate for an election
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

// 📥 Get vote logs by election with user info populated
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
