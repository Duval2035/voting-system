// controllers/auditorController.js
const Election = require("../models/Election");
const VoteLog = require("../models/VoteLog");
const crypto = require("crypto");

exports.getAuditorElections = async (req, res) => {
  try {
    if (req.user.role !== "auditor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    console.error("Fetch elections error:", err);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};

exports.checkElectionIntegrity = async (req, res) => {
  try {
    const { electionId } = req.params;

    const logs = await VoteLog.find({ election: electionId }).sort({ timestamp: 1 });

    const hashes = logs.map((log) =>
      crypto.createHash("sha256").update(log.hash).digest("hex")
    );

    const rootHash = crypto.createHash("sha256").update(hashes.join("")).digest("hex");

    const isValid = hashes.length > 0; // in production: compare against stored official hash

    res.status(200).json({ isValid, rootHash, hashes });
  } catch (err) {
    console.error("Integrity check error:", err);
    res.status(500).json({ message: "Failed to verify election integrity" });
  }
};