// backend/controllers/auditorController.js
const Election = require("../models/Election");
const VoteLog = require("../models/VoteLog");
const crypto = require("crypto");

exports.getAuditorElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.status(200).json(elections);
  } catch (err) {
    console.error("Fetch elections error:", err);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};

exports.getElectionIntegrity = async (req, res) => {
  const { electionId } = req.params;

  try {
    const logs = await VoteLog.find({ election: electionId }).sort({ timestamp: 1 });

    const hashes = logs.map((log) => log.hash);
    const combined = hashes.join("");
    const rootHash = crypto.createHash("sha256").update(combined).digest("hex");

    const isValid = rootHash && hashes.length > 0;

    res.status(200).json({
      isValid,
      rootHash,
      totalLogs: logs.length,
      sampleHashes: hashes.slice(0, 5), // Preview of the first 5
    });
  } catch (err) {
    console.error("Integrity check error:", err);
    res.status(500).json({ message: "Failed to verify integrity" });
  }
};
