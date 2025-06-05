// backend/controllers/auditorController.js
const Election = require("../models/Election");
const VoteLog = require("../models/VoteLog");

exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.status(200).json(elections);
  } catch (error) {
    console.error("Auditor Fetch Error:", error);
    res.status(500).json({ message: "Failed to load elections." });
  }
};
exports.verifyElectionIntegrity = async (req, res) => {
  try {
    const electionId = req.params.id;
    const logs = await VoteLog.find({ election: electionId }).sort({ timestamp: 1 });

    const hashes = logs.map(log => log.hash);
    const root = computeMerkleRoot(hashes);

    const isValid = Boolean(root); // Add real validation logic here

    res.status(200).json({
      isValid,
      merkleRoot: root,
      sampleHashes: hashes.slice(0, 10)
    });
  } catch (err) {
    console.error("Integrity check failed:", err);
    res.status(500).json({ message: "Integrity check error" });
  }
};

