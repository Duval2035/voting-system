const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/voters", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["user", "candidate"] } });
    res.status(200).json(users);
  } catch (err) {
    console.error("Failed to fetch voters", err);
    res.status(500).json({ message: "Error fetching voters" });
  }
});

module.exports = router;
