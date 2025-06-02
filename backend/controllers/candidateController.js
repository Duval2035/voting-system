const Candidate = require('../models/Candidate');
const path = require('path');

// Add or Update Candidate
exports.addOrUpdateCandidate = async (req, res) => {
  try {
    const electionId = req.params.id;
    const candidateId = req.params.candidateId;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.existingImage || "";

    const data = {
      name: req.body.name,
      position: req.body.position,
      bio: req.body.bio,
      image: imageUrl,
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
  } catch (err) {
    console.error("Error saving candidate:", err);
    res.status(500).json({ message: "Failed to save candidate." });
  }
};

exports.addCandidate = async (req, res) => {
  try {
    const { name, position, bio } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const electionId = req.params.id;
    const userId = req.user.userId; // 👈 get logged-in user

    const candidate = new Candidate({
      name,
      position,
      bio,
      image: imageUrl,
      election: electionId,
      userId, // 👈 attach the user to this candidate
    });

    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    console.error("Add candidate error:", err);
    res.status(500).json({ message: "Failed to add candidate" });
  }
};
exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.status(200).json(candidates);
  } catch (err) {
    console.error("Error loading candidates:", err);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Candidate deleted" });
  } catch (err) {
    console.error("Error deleting candidate:", err);
    res.status(500).json({ message: "Failed to delete candidate" });
  }
};
