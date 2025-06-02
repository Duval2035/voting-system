// backend/controllers/auditorController.js
const Election = require("../models/Election");

exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.status(200).json(elections);
  } catch (error) {
    console.error("Auditor Fetch Error:", error);
    res.status(500).json({ message: "Failed to load elections." });
  }
};
