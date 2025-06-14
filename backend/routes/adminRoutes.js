// GET /admin/voters/by-election/:electionId
const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Election = require("../models/Election");
const authenticateAdmin = require("../middleware/authenticateAdmin");

router.get("/voters/by-election/:electionId", authenticateAdmin, async (req, res) => {
  const { electionId } = req.params;

  try {
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    const voters = await Voter.find({ elections: electionId }).select("username email _id");
    res.json({ voters });
  } catch (error) {
    console.error("Error fetching voters by election:", error);
    res.status(500).json({ message: "Server error fetching voters" });
  }
});

router.get("/elections", authenticateAdmin, async (req, res) => {
  try {
    const elections = await Election.find().select("title date _id");
    res.json({ elections });
  } catch (error) {
    console.error("Error fetching elections:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
});
router.get("/elections/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const election = await Election.findById(id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    res.json(election);
  } catch (error) {
    console.error("Error fetching election by ID:", error);
    res.status(500).json({ message: "Server error fetching election" });
  }
});

module.exports = router;
