const express = require("express");
const router = express.Router();
const { getAllVoteLogs } = require("../controllers/voteLogController");
const authMiddleware = require("../middleware/authMiddleware");
const { getResults } = require("../controllers/voteController");

router.get("/", authMiddleware, getAllVoteLogs);
router.get("/results/:id", authMiddleware, getResults);

module.exports = router;
