const express = require("express");
const router = express.Router();

const Election = require("../models/Election");
const Voter = require("../models/Voter");

const authenticateAdmin = require("../middleware/authenticateAdmin");
const authorizeRoles = require("../middleware/authorizeRoles");
const authenticate = require("../middleware/authenticateUser");
const {
  getEligibleVoters,
  assignVotersToElection,
  getVotersByElection,
  getAllVoters
} = require("../controllers/adminController");

// Debug logs
console.log("authenticateAdmin:", typeof authenticateAdmin);
console.log("getEligibleVoters:", typeof getEligibleVoters);

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

// ✅ Get eligible voters for a specific election
router.get("/elections/:electionId/eligible-voters", authenticateAdmin, getEligibleVoters);

// ✅ Assign voters to an election
router.post("/elections/:electionId/assign-voters", authenticateAdmin, assignVotersToElection);

// ✅ Get all voters globally
router.get("/voters", authenticateAdmin, getAllVoters);

// ✅ Get voters assigned to an election
router.get("/voters-by-election/:electionId", authenticateAdmin, getVotersByElection);

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

