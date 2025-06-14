// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const Election = require("../models/Election");
const Voter = require("../models/Voter");
const authenticateAdmin = require("../middleware/authenticateAdmin");
const authorizeRoles = require("../middleware/authorizeRoles");

router.get("/elections", authenticateAdmin, authorizeRoles("admin"), async (req, res) => {
  try {
    const elections = await Election.find({}, "_id title").lean();
    res.json(elections); // ✅ Always send JSON
  } catch (err) {
    console.error("❌ Failed to fetch elections:", err);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
});
// GET voters for a specific election
router.get("/voters-by-election/:id", authenticateAdmin, authorizeRoles("admin"), async (req, res) => {
  const electionId = req.params.id;

  try {
    const voters = await Voter.find({ electionId })
      .populate("userId", "name email")
      .lean();

    const voterList = voters.map(v => ({
      _id: v.userId._id,
      name: v.userId.name,
      email: v.userId.email,
    }));

    res.json({ voters: voterList });
  } catch (err) {
    console.error("Error fetching voters:", err);
    res.status(500).json({ message: "Failed to fetch voters." });
    res.status(401).json({ message: "No token provided" });
  }
});


module.exports = router;
