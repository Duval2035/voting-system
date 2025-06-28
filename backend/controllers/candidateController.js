const Candidate = require("../models/Candidate");
const { contract } = require("../blockchain/contractService");

exports.addOrUpdateCandidate = async (req, res) => {
  try {
    const { name, position, bio, electionId } = req.body;

    if (!name || !electionId) {
      return res.status(400).json({ message: "Name and electionId are required" });
    }

    // ✅ Add to Blockchain (as Admin)
   

    const tx = await contract.addCandidate(name, electionId);
    await tx.wait();

    // ✅ Get candidate count from blockchain
    const countBigInt = await contract.getCandidatesCount(electionId);
    const blockchainId = Number(countBigInt) - 1; // Safely convert BigInt to Number

    // ✅ Save to MongoDB
    const newCandidate = new Candidate({
      name,
      position,
      bio,
      election: electionId,
      blockchainId,
      image: req.file?.path,
    });

    await newCandidate.save();
    res.status(201).json({ message: "✅ Candidate added to DB and blockchain", candidate: newCandidate });
  } catch (err) {
    console.error("❌ Error saving candidate:", err);
    res.status(500).json({ message: "Failed to save candidate." });
  }
};

// 📋 Get candidates for an election
exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.status(200).json(candidates);
  } catch (error) {
    console.error("❌ Error fetching candidates:", error);
    res.status(500).json({ message: "Failed to fetch candidates." });
  }
};

// ❌ Delete candidate
exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Candidate deleted." });
  } catch (error) {
    console.error("❌ Error deleting candidate:", error);
    res.status(500).json({ message: "Failed to delete candidate." });
  }
};


