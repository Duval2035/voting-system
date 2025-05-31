// backend/controllers/candidateController.js
const Candidate = require("../models/Candidate");

// ✅ Add a new candidate (with image upload support)
exports.addCandidate = async (req, res) => {
  try {
    const electionId = req.params.id;
    const { name, position, bio } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image || "";

    const candidate = new Candidate({
      election: electionId,
      name,
      position,
      bio,
      image: imageUrl,
    });

    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    console.error("Add candidate error:", err);
    res.status(500).json({ message: "Failed to add candidate" });
  }
};

// ✅ Get candidates by election
exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.status(200).json(candidates);
  } catch (err) {
    console.error("Get candidates error:", err);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
};

// ✅ Update candidate (with optional image upload)
exports.updateCandidate = async (req, res) => {
  try {
    const { name, position, bio } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image || "";

    const updateData = { name, position, bio };
    if (imageUrl) updateData.image = imageUrl;

    const updated = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update candidate error:", err);
    res.status(500).json({ message: "Failed to update candidate" });
  }
};

// ✅ Delete candidate
exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Candidate deleted" });
  } catch (err) {
    console.error("Delete candidate error:", err);
    res.status(500).json({ message: "Failed to delete candidate" });
  }
};
