// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const Election = require("../models/Election");
const Voter = require("../models/Voter");
const authenticateAdmin = require("../middleware/authenticateAdmin");
const authorizeRoles = require("../middleware/authorizeRoles");

// GET /api/admin/elections
// Get all elections (only id and title)
router.get("/elections", authenticateAdmin, authorizeRoles("admin"), async (req, res) => {
  try {
    const elections = await Election.find({}, "_id title").lean();
    res.json(elections);
  } catch (err) {
    console.error("❌ Failed to fetch elections:", err);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
});

// GET /api/admin/voters-by-election/:id
// Get voters for a specific election, plus total count
router.get("/voters-by-election/:id", authenticateAdmin, authorizeRoles("admin"), async (req, res) => {
  const electionId = req.params.id;

  try {
    const voters = await Voter.find({ election: electionId }).lean();

    const totalVoters = voters.length;

    res.json({ totalVoters, voters });
  } catch (err) {
    console.error("❌ Error fetching voters:", err);
    res.status(500).json({ message: "Failed to fetch voters." });
  }
});

// Add a new voter to an election
router.post("/add-voter", authenticateAdmin, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, electionId } = req.body;

    if (!name || !email || !electionId) {
      return res.status(400).json({ message: "All fields (name, email, electionId) are required." });
    }

    const electionExists = await Election.findById(electionId);
    if (!electionExists) {
      return res.status(404).json({ message: "Election not found." });
    }

    const existingVoter = await Voter.findOne({ email, election: electionId });
    if (existingVoter) {
      return res.status(400).json({ message: "Voter already registered for this election." });
    }

    const newVoter = new Voter({ name, email, election: electionId });
    await newVoter.save();

    console.log("✅ Voter added:", newVoter);
    res.status(201).json({ message: "Voter added successfully", voter: newVoter });

  } catch (err) {
    console.error("❌ Error adding voter:", err);
    console.error(err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
