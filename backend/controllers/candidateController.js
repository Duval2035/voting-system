// backend/controllers/candidateController.js
const Candidate = require("../models/Candidate");

exports.addCandidate = async (req, res) => {
  try {
    const electionId = req.params.id;
    const { name, position, bio, image } = req.body;

    const candidate = new Candidate({
      election: electionId,
      name,
      position,
      bio,
      image,
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
    console.error("Get candidates error:", err);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const { name, position, bio, image } = req.body;

    const updated = await Candidate.findByIdAndUpdate(
      req.params.candidateId,
      { name, position, bio, image },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update candidate error:", err);
    res.status(500).json({ message: "Failed to update candidate" });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.candidateId);
    res.status(200).json({ message: "Candidate deleted" });
  } catch (err) {
    console.error("Delete candidate error:", err);
    res.status(500).json({ message: "Failed to delete candidate" });
  }
};
