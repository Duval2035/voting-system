const mongoose = require("mongoose");
const crypto = require("crypto");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const VoteLog = require("../models/VoteLog");
const { voteOnBlockchain } = require("../blockchain/contractService");
const logger = require("../utils/logger");

// 📥 Submit a vote
const submitVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user?._id;

  logger.info("submitVote called", { electionId, candidateId, userId });

  if (!userId) {
    logger.warn("Unauthorized vote attempt");
    return res.status(401).json({ success: false, message: "Unauthorized: User not authenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(electionId) || !mongoose.Types.ObjectId.isValid(candidateId)) {
    logger.warn("Invalid election or candidate ID");
    return res.status(400).json({ success: false, message: "Invalid election or candidate ID" });
  }

  try {
    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) {
      logger.warn("Candidate not found for election", { candidateId, electionId });
      return res.status(404).json({ success: false, message: "Candidate not found in this election" });
    }

    const existingVote = await Vote.findOne({ election: electionId, user: userId });
    if (existingVote) {
      logger.warn("User already voted", { userId, electionId });
      return res.status(409).json({ success: false, message: "You have already voted in this election." });
    }

    if (typeof candidate.blockchainId !== "number") {
      logger.warn("Candidate blockchainId invalid or missing", { candidateId });
      return res.status(400).json({ success: false, message: "Candidate has no valid blockchain ID" });
    }

    const backendPrivateKey = process.env.BACKEND_PRIVATE_KEY;
    if (!backendPrivateKey) {
      logger.error("Backend private key not configured");
      return res.status(500).json({ success: false, message: "Server misconfiguration: Backend private key missing" });
    }

    let receipt;
    try {
      logger.info("Sending blockchain vote...", {
        candidateBlockchainId: candidate.blockchainId,
        electionId,
        userId,
      });

      receipt = await voteOnBlockchain(candidate.blockchainId, electionId, backendPrivateKey);

      if (receipt.status !== 1) {
        logger.error("Blockchain transaction reverted", { txHash: receipt.transactionHash });
        return res.status(500).json({ success: false, message: "Blockchain transaction failed" });
      }

      logger.info("Vote mined on-chain", { txHash: receipt.transactionHash });
    } catch (bcErr) {
      logger.error("Blockchain vote failed: %s", bcErr.message);
      return res.status(500).json({ success: false, message: "Blockchain vote failed", error: bcErr.message });
    }

    const vote = new Vote({
      election: electionId,
      candidate: candidate._id,
      user: userId,
    });
    await vote.save();

    const timestamp = new Date();
    const hash = crypto.createHash("sha256")
      .update(`${userId}-${electionId}-${candidate.blockchainId}-${timestamp}`)
      .digest("hex");

    const log = new VoteLog({
      user: userId,
      election: electionId,
      timestamp,
      hash,
      txHash: receipt.transactionHash,
    });
    await log.save();

    logger.info("Vote recorded and logged", {
      userId,
      electionId,
      candidateId,
      txHash: receipt.transactionHash,
    });

    return res.status(200).json({
      success: true,
      message: "✅ Vote successfully recorded!",
      txHash: receipt.transactionHash,
    });
  } catch (err) {
    logger.error("Error in submitVote: %s", err.message);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

// 📊 Get results for an election
const getResults = async (req, res) => {
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
          image: candidate.image || null,
          voteCount,
        };
      })
    );

    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Error in getResults:", err);
    res.status(500).json({ message: "Failed to fetch results", error: err.message });
  }
};

// 📜 Get all vote logs
const getVoteLogs = async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId }).populate("user", "username");
    res.status(200).json(logs);
  } catch (err) {
    console.error("❌ Error fetching vote logs:", err);
    res.status(500).json({ message: "Failed to fetch vote logs", error: err.message });
  }
};

// 📋 Get all votes by election
const getVotesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    const votes = await Vote.find({ election: electionId })
      .populate("user", "email fullName")
      .populate("candidate", "name");

    return res.status(200).json(votes);
  } catch (error) {
    console.error("❌ Error in getVotesByElection:", error);
    return res.status(500).json({ message: "Failed to fetch votes", error: error.message });
  }
};

// 📤 Export to CSV placeholder
const exportVoteLogsCSV = async (req, res) => {
  res.status(200).json({ message: "📤 CSV export endpoint placeholder" });
};

module.exports = {
  submitVote,
  getResults,
  getVoteLogs,
  getVotesByElection,
  exportVoteLogsCSV,
};
