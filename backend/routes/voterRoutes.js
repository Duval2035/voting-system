const express = require("express");
const router = express.Router();
const authenticateAdmin = require("../middleware/authenticateAdmin");
const User = require("../models/User");
const Election = require("../models/Election");

// ✅ Fetch users (to assign as voters)
router.get("/admin/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("username email");
    res.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ Assign voters to an election
router.post("/admin/elections/:electionId/assign-voters", authenticateAdmin, async (req, res) => {
  const { electionId } = req.params;
  const { voterIds } = req.body;

  try {
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    election.voterIds = voterIds;
    await election.save();

    res.status(200).json({ message: "Voters assigned successfully" });
  } catch (err) {
    console.error("Error assigning voters:", err);
    res.status(500).json({ message: "Failed to assign voters" });
  }
});

// ✅ Get voters by election
router.get("/admin/voters/by-election/:electionId", authenticateAdmin, async (req, res) => {
  const { electionId } = req.params;

  try {
    const election = await Election.findById(electionId).populate("voterIds", "username email");
    if (!election) return res.status(404).json({ message: "Election not found" });

    res.json({ voters: election.voterIds });
  } catch (err) {
    console.error("Error loading voters:", err);
    res.status(500).json({ message: "Failed to load voters" });
  }
});



module.exports = router;
