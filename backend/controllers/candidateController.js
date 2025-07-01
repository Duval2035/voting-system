const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const { addCandidate, contract } = require("../blockchain/contractService");

// Add new candidate or update existing one with blockchain integration
const addOrUpdateCandidate = async (req, res) => {
  try {
    const { id: electionId, candidateId } = req.params; // electionId or candidateId depending on route
    const { name, position, bio } = req.body;

    if (!name || !electionId) {
      return res.status(400).json({ message: "Name and electionId are required" });
    }

    if (candidateId) {
      // Update existing candidate in DB only
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });

      candidate.name = name;
      candidate.position = position;
      candidate.bio = bio;
      candidate.election = electionId;

      if (req.file) {
        candidate.image = req.file.path.replace(/\\/g, "/");
      }

      await candidate.save();
      return res.status(200).json(candidate);
    }

    // Add new candidate to blockchain first
    console.log("🔁 Adding candidate to blockchain...");
    const blockchainId = await addCandidate(name, electionId);
    console.log("✅ Candidate added to blockchain with ID:", blockchainId);

    // Then add candidate to MongoDB
    const newCandidate = new Candidate({
      name,
      position,
      bio,
      election: electionId,
      blockchainId,
      image: req.file ? req.file.path.replace(/\\/g, "/") : null,
    });

    await newCandidate.save();
    res.status(201).json({ message: "Candidate added to DB and blockchain", candidate: newCandidate });
  } catch (err) {
    console.error("❌ Error saving candidate:", err);
    res.status(500).json({ message: "Failed to save candidate." });
  }
};

// Get candidates by election from MongoDB
const getCandidatesByElectionDB = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ message: "Invalid election ID." });
    }

    const candidates = await Candidate.find({ election: electionId });
    if (!candidates.length) {
      return res.status(404).json({ message: "No candidates found for this election." });
    }

    res.status(200).json(candidates);
  } catch (error) {
    console.error("❌ Error fetching candidates from DB:", error);
    res.status(500).json({ message: "Failed to fetch candidates." });
  }
};

// Get candidates from Blockchain
const getCandidatesByElectionBlockchain = async (req, res) => {
  try {
    const { electionId } = req.params;
    const candidates = await contract.getCandidatesByElection(electionId);

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ message: "No candidates found for this election" });
    }

    const formattedCandidates = candidates.map(c => ({
      id: c.id.toNumber(),
      name: c.name,
      electionId: c.electionId,
      voteCount: c.voteCount.toNumber(),
    }));

    res.status(200).json(formattedCandidates);
  } catch (error) {
    console.error("❌ Error fetching candidates from blockchain:", error);
    res.status(500).json({ message: "Failed to fetch candidates from blockchain." });
  }
};

// Get candidate by ID (MongoDB)
const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid candidate ID." });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json(candidate);
  } catch (error) {
    console.error("❌ Error fetching candidate by ID:", error);
    res.status(500).json({ message: "Failed to fetch candidate." });
  }
};

// Delete candidate by ID (MongoDB)
const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid candidate ID." });
    }

    const deleted = await Candidate.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json({ message: "Candidate deleted." });
  } catch (error) {
    console.error("❌ Error deleting candidate:", error);
    res.status(500).json({ message: "Failed to delete candidate." });
  }
};

module.exports = {
  addOrUpdateCandidate,
  getCandidatesByElectionDB,
  getCandidatesByElectionBlockchain,
  getCandidateById,
  deleteCandidate,
};
