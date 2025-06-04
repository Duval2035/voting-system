const Candidate = require('../models/Candidate');
const path = require('path');

// Create or update a candidate

exports.addOrUpdateCandidate = async (req, res) => {
  try {
    const electionId = req.params.id;
    const candidateId = req.params.candidateId;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.existingImage || "";

    const candidateData = {
      name: req.body.name,
      position: req.body.position,
      bio: req.body.bio,
      image: imageUrl,
      election: electionId,
    };

    let candidate;
    if (candidateId) {
      candidate = await Candidate.findByIdAndUpdate(candidateId, candidateData, { new: true });
    } else {
      candidate = new Candidate(candidateData);
      await candidate.save();
    }

    return res.status(200).json(candidate);
  } catch (error) {
    console.error("❌ Error saving candidate:", error);
    return res.status(500).json({ message: "Failed to save candidate." });
  }
};

exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch candidates." });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Candidate deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete candidate." });
  }
};