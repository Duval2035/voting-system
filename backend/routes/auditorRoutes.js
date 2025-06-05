const express = require("express");
const router = express.Router();
const VoteLog = require("../models/VoteLog");
const { computeMerkleRoot } = require("../utils/merkle");
const authMiddleware = require("../middleware/authMiddleware");
const { getElectionIntegrityData } = require("../controllers/auditorController");
const Election = require("../models/Election");

router.get("/integrity/:electionId", authMiddleware, getElectionIntegrityData);
router.get("/integrity/:id", authMiddleware, verifyElectionIntegrity);

router.get("/integrity/:electionId", authMiddleware, async (req, res) => {
  try {
    const logs = await VoteLog.find({ election: req.params.electionId });
    const hashes = logs.map(log => log.hash);
    const merkleRoot = computeMerkleRoot(hashes);

    res.status(200).json({
      totalLogs: logs.length,
      merkleRoot,
      logsPreview: hashes.slice(0, 5), // show first 5 for visual check
    });
  } catch (err) {
    console.error("Election integrity error:", err);
    res.status(500).json({ message: "Failed to compute election integrity." });
  }
});

module.exports = router;
