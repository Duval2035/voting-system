const mongoose = require("mongoose");
const crypto = require("crypto");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const VoteLog = require("../models/VoteLog");
const contract = require("../utils/blockchain"); // make sure this exports your blockchain contract instance

// 🗳️ Submit a vote (on-chain + DB)
const submitVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user?._id;
  const userEmail = req.user?.email || "unknown";

  if (!userId) return res.status(401).json({ message: "Unauthorized: No user info found" });

  if (!mongoose.Types.ObjectId.isValid(electionId) || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.status(400).json({ message: "Invalid election or candidate ID" });
  }

  try {
    // Check candidate exists in election
    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) return res.status(404).json({ message: "Candidate not found in this election" });

    // Prevent double voting by user for election
    const alreadyVoted = await Vote.findOne({ election: electionId, user: userId });
    if (alreadyVoted) return res.status(409).json({ message: "You have already voted in this election." });

    if (!candidate.blockchainId) return res.status(400).json({ message: "Candidate blockchainId missing" });

    // Call blockchain vote function (assumes contract.vote(blockchainId))
    try {
      const tx = await contract.vote(Number(candidate.blockchainId));
      await tx.wait(); // wait for blockchain tx to confirm
    } catch (blockchainError) {
      return res.status(500).json({ message: "Blockchain transaction failed", error: blockchainError.message });
    }

    // Record vote in DB
    const vote = new Vote({ election: electionId, candidate: candidate._id, user: userId });
    await vote.save();

    // Log vote with hashed proof
    const timestamp = new Date();
    const hash = crypto.createHash("sha256")
      .update(`${userId}-${electionId}-${candidate.blockchainId}-${timestamp.toISOString()}`)
      .digest("hex");

    const log = new VoteLog({ user: userId, election: electionId, timestamp, hash });
    await log.save();

    return res.status(200).json({ message: "✅ Vote successfully submitted and recorded on blockchain" });
  } catch (err) {
    return res.status(500).json({ message: "Server error during vote submission", error: err.message });
  }
};

// 📋 Get votes by election (can expand as needed)
const getVotesByElection = async (req, res) => {
  res.status(200).json({ message: "📋 Votes by election placeholder" });
};

// 📊 Get election results (votes counted per candidate)
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
          image: candidate.image || "/default-user.png",
          voteCount,
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ getResults error:", error);
    res.status(500).json({ message: "Failed to fetch election results." });
  }
};

// 📋 Get vote logs for audit/tracking
const getVoteLogs = async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId }).populate("user", "username");
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vote logs." });
  }
};

// 📤 CSV export placeholder (expand if needed)
const exportVoteLogsCSV = async (req, res) => {
  res.status(200).json({ message: "📤 CSV export placeholder" });
};

module.exports = {
  submitVote,
  getVotesByElection,
  getResults,
  getVoteLogs,
  exportVoteLogsCSV,
};
