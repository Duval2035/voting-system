const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middleware/authMiddleware"); // ✅ Destructure correct function
const {
  getVoteLogs,
  exportVoteLogsCSV,
} = require("../controllers/voteController");

// More specific route first
router.get("/export/:electionId", protectAdmin, exportVoteLogsCSV);

// Get vote logs for a specific election
router.get("/:electionId", protectAdmin, async (req, res) => {
  try {
    const logs = await getVoteLogs(req.params.electionId);
    if (!logs) {
      return res.json([]);
    }
    res.json(logs);
  } catch (error) {
    console.error("Error fetching vote logs:", error);
    res.status(500).json({ message: "Server error fetching vote logs." });
  }
});

module.exports = router;
