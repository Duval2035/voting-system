const mongoose = require("mongoose");
const path = require("path");
const Candidate = require("../models/Candidate");
const { addCandidateToBlockchain } = require("../blockchain/contractService");

/**
 * Add new candidate (Blockchain + MongoDB)
 */
const addCandidate = async (req, res) => {
  try {
    const { name, position, bio, electionId } = req.body;
    if (!name || !electionId) {
      return res.status(400).json({ message: "Name and election ID are required." });
    }

    console.log("📤 Creating candidate:", { name, position, bio, electionId });

    // Blockchain add
    const blockchainId = await addCandidateToBlockchain(name, electionId);
    console.log("🧾 Blockchain ID:", blockchainId);

    const imagePath = req.file
      ? path.join("candidates", req.file.filename).replace(/\\/g, "/")
      : null;

    const newCandidate = new Candidate({
      name,
      position,
      bio,
      election: electionId,
      blockchainId,
      image: imagePath,
    });

    await newCandidate.save();

    res.status(201).json({
      message: "✅ Candidate created on blockchain and DB.",
      candidate: newCandidate,
    });
  } catch (error) {
    console.error("❌ Error in addCandidate:", error);
    res.status(500).json({ message: "Failed to add candidate", error: error.message });
  }
};

/**
 * Update candidate (MongoDB only)
 */
const addOrUpdateCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { name, position, bio, electionId } = req.body;

    if (!name || !electionId) {
      return res.status(400).json({ message: "Name and election ID are required." });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    candidate.name = name;
    candidate.position = position;
    candidate.bio = bio;
    candidate.election = electionId;

    if (req.file) {
      candidate.image = path.join("candidates", req.file.filename).replace(/\\/g, "/");
    }

    await candidate.save();
    return res.status(200).json({ message: "Candidate updated.", candidate });
  } catch (error) {
    console.error("❌ Error in addOrUpdateCandidate:", error);
    res.status(500).json({ message: "Server error updating candidate.", error: error.message });
  }
};

/**
 * Get candidates by election
 */
const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const candidates = await Candidate.find({ election: electionId });
    res.status(200).json(candidates);
  } catch (error) {
    console.error("❌ Error fetching candidates:", error);
    res.status(500).json({ message: "Failed to fetch candidates.", error: error.message });
  }
};

/**
 * Get candidate by ID
 */
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
    res.status(500).json({ message: "Failed to get candidate.", error: error.message });
  }
};

/**
 * Delete candidate
 */
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
    res.status(500).json({ message: "Failed to delete candidate.", error: error.message });
  }
};

module.exports = {
  addCandidate,
  addOrUpdateCandidate,
  getCandidatesByElection,
  getCandidateById,
  deleteCandidate,
};
