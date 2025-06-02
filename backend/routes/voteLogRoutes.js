const express = require("express");
const router = express.Router();
const { getAllVoteLogs } = require("../controllers/voteLogController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getAllVoteLogs);

module.exports = router;
