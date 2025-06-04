// backend/routes/auditorRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Election = require("../models/Election");

router.get("/elections", authMiddleware, async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.status(200).json(elections);
  } catch (err) {
    console.error("Auditor election fetch error:", err);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
});

module.exports = router;
