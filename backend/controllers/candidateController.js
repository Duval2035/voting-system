const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const { addCandidate: addCandidateToBlockchain, contract } = require("../blockchain/contractService");

// ✅ Add New Candidate (Blockchain + DB)
const addCandidate = async (req, res) => {
  try {
    const { name, position, bio, electionId } = req.body;

    if (!name || !electionId) {
      return res.status(400).json({ message: "Name and election ID are required." });
    }

    const blockchainId = await addCandidateToBlockchain(name, electionId);

    const newCandidate = new Candidate({
      name,
      position,
      bio,
      election: electionId,
      blockchainId,
      image: req.file ? req.file.path.replace(/\\/g, "/") : null,
    });

    await newCandidate.save();
    res.status(201).json({ message: "Candidate created.", candidate: newCandidate });
  } catch (error) {
    console.error("❌ Error in addCandidate:", error);
    res.status(500).json({ message: "Failed to add candidate." });
  }
};

// ✅ Add or Update Candidate (single endpoint)
const addOrUpdateCandidate = async (req, res) => {
  try {
    const { id: electionId, candidateId } = req.params;
    const { name, position, bio } = req.body;

    if (!name || !electionId) {
      return res.status(400).json({ message: "Name and election ID are required." });
    }

    // 🔁 Update
    if (candidateId) {
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found." });
      }

      candidate.name = name;
      candidate.position = position;
      candidate.bio = bio;
      candidate.election = electionId;

      if (req.file) {
        candidate.image = req.file.path.replace(/\\/g, "/");
      }

      await candidate.save();
      return res.status(200).json({ message: "Candidate updated.", candidate });
    }

    // ➕ Add new
    const blockchainId = await addCandidateToBlockchain(name, electionId);

    const newCandidate = new Candidate({
      name,
      position,
      bio,
      election: electionId,
      blockchainId,
      image: req.file ? req.file.path.replace(/\\/g, "/") : null,
    });

    await newCandidate.save();
    return res.status(201).json({ message: "Candidate created.", candidate: newCandidate });
  } catch (error) {
    console.error("❌ Error in addOrUpdateCandidate:", error);
    res.status(500).json({ message: "Server error saving candidate." });
  }
};

// ✅ Get Candidates (MongoDB)
const getCandidatesByElectionDB = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!electionId) {
      return res.status(400).json({ message: "Election ID is required." });
    }

    const candidates = await Candidate.find({ election: electionId });
    res.status(200).json(candidates);
  } catch (error) {
    console.error("❌ Failed to get candidates from DB:", error);
    res.status(500).json({ message: "Failed to get candidates." });
  }
};

// ✅ Get Candidates (Blockchain)
const getCandidatesByElectionBlockchain = async (req, res) => {
  try {
    const { electionId } = req.params;

    const candidates = await contract.getCandidatesByElection(electionId);

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ message: "No candidates found on blockchain." });
    }

    const formatted = candidates.map(c => ({
      id: c.id.toNumber(),
      name: c.name,
      electionId: c.electionId,
      voteCount: c.voteCount.toNumber(),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("❌ Error fetching candidates from blockchain:", error);
    res.status(500).json({ message: "Blockchain fetch failed." });
  }
};

// ✅ Get Candidate by ID (MongoDB)
const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid candidate ID." });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    res.status(200).json(candidate);
  } catch (error) {
    console.error("❌ Failed to get candidate by ID:", error);
    res.status(500).json({ message: "Failed to get candidate." });
  }
};

// ✅ Delete Candidate (MongoDB only)
const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid candidate ID." });
    }

    const deleted = await Candidate.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    res.status(200).json({ message: "Candidate deleted successfully." });
  } catch (error) {
    console.error("❌ Failed to delete candidate:", error);
    res.status(500).json({ message: "Failed to delete candidate." });
  }
};

// ✅ Get Candidates (Generic)
const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const candidates = await Candidate.find({ election: electionId });
    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
};

// ✅ Export all functions
module.exports = {
  addCandidate,
  addOrUpdateCandidate,
  getCandidatesByElection,
  getCandidatesByElectionDB,
  getCandidatesByElectionBlockchain,
  getCandidateById,
  deleteCandidate,
};
