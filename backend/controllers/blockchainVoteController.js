const Voter = require("../models/Voter");
const { contract } = require("../blockchain/contractService");

exports.castVoteOnBlockchain = async (req, res) => {
  try {
    const { email, electionId, blockchainId } = req.body;

    console.log("📥 Incoming vote data:", req.body);

    // 1. Validate voter
    const voter = await Voter.findOne({ email, election: electionId });

    if (!voter) {
      return res.status(404).json({ message: "Voter not found." });
    }

    if (voter.hasVoted) {
      return res.status(400).json({ message: "You have already voted in this election." });
    }

    // 2. Call blockchain vote
    const tx = await contract.vote(blockchainId);
    await tx.wait();

    // 3. Mark voter as voted
    voter.hasVoted = true;
    await voter.save();

    res.status(200).json({ message: "✅ Vote cast successfully on blockchain." });
  } catch (error) {
    console.error("❌ Vote error:", error);
    res.status(500).json({ message: "❌ Blockchain vote failed", error: error.message });
  }
};

exports.castVoteOnBlockchain = async (req, res) => {
  try {
    const { candidateId, electionId, email } = req.body;

    if (!candidateId || !electionId || !email) {
      return res.status(400).json({ message: "Missing vote details." });
    }

    const voter = await Voter.findOne({ email, election: electionId });
    if (!voter) {
      return res.status(404).json({ message: "Voter not found." });
    }

    // Optional: prevent double voting
    if (voter.hasVoted) {
      return res.status(403).json({ message: "You have already voted in this election." });
    }

    const tx = await contract.vote(candidateId);
    await tx.wait();

    // ✅ Mark voter as voted
    voter.hasVoted = true;
    await voter.save();

    res.status(200).json({ message: "✅ Vote recorded on blockchain" });
  } catch (err) {
    console.error("❌ Blockchain vote failed:", err);
    res.status(500).json({ message: "Blockchain vote failed." });
  }
};