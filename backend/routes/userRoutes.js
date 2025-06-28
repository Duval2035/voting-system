const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Election = require("../models/Election");

// GET elections for the logged-in user
router.get("/elections", authMiddleware, async (req, res) => {
  try {
    const userOrg = req.user.organizationName;
    const elections = await Election.find({ organizationName: userOrg });
    res.json(elections);
  } catch (err) {
    console.error("❌ Error fetching elections:", err);
    res.status(500).json({ message: "Server error fetching elections." });
  }
});

module.exports = router;
