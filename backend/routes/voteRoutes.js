const express = require("express");
const router = express.Router();
const { submitVote, getResults } = require("../controllers/voteController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, submitVote);
router.get("/results/:id", getResults); // ✅ this must exist

module.exports = router;
