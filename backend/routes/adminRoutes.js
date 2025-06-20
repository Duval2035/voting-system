const express = require("express");
const router = express.Router();

const Election = require("../models/Election");
const Voter = require("../models/Voter");
const authenticateAdmin = require("../middleware/authenticateAdmin");
const authorizeRoles = require("../middleware/authorizeRoles");
const adminController = require("../controllers/adminController");

// ✅ Get all elections (id and title only)
router.get("/elections", authenticateAdmin, authorizeRoles("admin"), async (req, res) => {
  try {
    const elections = await Election.find({}, "_id title").lean();
    res.json(elections);
  } catch (err) {
    console.error("Failed to fetch elections:", err);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
});
// ✅ Get all voters globally (role: user)
router.get("/voters-by-election/:electionId", adminController.getVotersByElection);
// ✅ Get voters for an election
router.get("/voters-by-election/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId).populate("voterIds", "username email");
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.json({ voters: election.voterIds });
  } catch (error) {
    console.error("Error fetching voters:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add new voter to election
router.post("/add-voter", authenticateAdmin, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, electionId } = req.body;
    if (!name || !email || !electionId) {
      return res.status(400).json({ message: "All fields required." });
    }

    const electionExists = await Election.findById(electionId);
    if (!electionExists) {
      return res.status(404).json({ message: "Election not found." });
    }

    const existingVoter = await Voter.findOne({ email, election: electionId });
    if (existingVoter) {
      return res.status(400).json({ message: "Voter already registered." });
    }

    const newVoter = new Voter({ name, email, election: electionId });
    await newVoter.save();

    res.status(201).json({ message: "Voter added successfully", voter: newVoter });
  } catch (err) {
    console.error("Error adding voter:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
