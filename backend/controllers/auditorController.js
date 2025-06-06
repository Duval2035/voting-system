// controllers/auditorController.js
const Election = require("../models/Election");

exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.status(200).json(elections);
  } catch (error) {
    console.error("Error fetching elections for auditor:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};
const VoteLog = require("../models/VoteLog");
const { Parser } = require("json2csv");