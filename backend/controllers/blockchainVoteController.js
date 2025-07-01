// backend/controllers/blockchainVoteController.js
const Voter = require("../models/Voter");
const { contract } = require("../blockchain/contractService");

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

    if (voter.hasVoted) {
      return res.status(403).json({ message: "You have already voted in this election." });
    }

    const tx = await contract.vote(candidateId);
    await tx.wait();

    voter.hasVoted = true;
    await voter.save();

    res.status(200).json({ message: "✅ Vote recorded on blockchain" });
  } catch (err) {
    console.error("❌ Blockchain vote failed:", err);
    res.status(500).json({ message: "Blockchain vote failed." });
  }
};
