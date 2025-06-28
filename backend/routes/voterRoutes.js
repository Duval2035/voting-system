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
router.get("/voters-by-election/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId).populate("voterIds", "name email");
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.json({ voters: election.voterIds });
  } catch (error) {
    console.error("Error fetching voters:", error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
