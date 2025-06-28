const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getVoteLogs,
  exportVoteLogsCSV
} = require("../controllers/voteController");

router.get("/:electionId", authMiddleware, getVoteLogs);
router.get("/export/:electionId", authMiddleware, exportVoteLogsCSV);

module.exports = router;



