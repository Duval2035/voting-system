const Candidate = require('../models/Candidate');
const path = require('path');

// Create or update a candidate

exports.addOrUpdateCandidate = async (req, res) => {
  try {
    const electionId = req.params.id;
    const candidateId = req.params.candidateId;

    // ✅ Fix: Check if req.file exists and get the image
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

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
    console.error("❌ Error saving candidate:", err); // <-- look at this in your terminal
    res.status(500).json({ message: "Failed to save candidate." });
  }
};
exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.status(200).json(candidates);
  } catch (err) {
    console.error("Fetch candidates error:", err);
    res.status(500).json({ message: "Failed to fetch candidates." });
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
