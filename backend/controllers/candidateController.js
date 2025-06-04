const Candidate = require('../models/Candidate');
const path = require('path');

// Create or update a candidate
exports.addOrUpdateCandidate = async (req, res) => {
  try {
    const { name, position, bio } = req.body;
    const electionId = req.params.id;
    const candidateId = req.params.candidateId;

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const data = {
      name,
      position,
      bio,
      image: image,
      election: electionId,
    };

    let candidate;
    if (candidateId) {
      candidate = await Candidate.findByIdAndUpdate(candidateId, data, { new: true });
    } else {
      candidate = new Candidate(data);
      await candidate.save();
    }

    res.status(200).json(candidate);
  } catch (error) {
    console.error("Error saving candidate:", error);
    res.status(500).json({ message: "Failed to save candidate." });
  }
};

exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Failed to fetch candidates." });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Candidate deleted." });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Failed to delete candidate." });
  }
};