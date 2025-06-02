
// routes/voteRoutes.js
const express = require("express");
const router = express.Router();
const {
  submitVote,
  getResults,
  getCandidateResults // ✅ add this here
} = require("../controllers/voteController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, submitVote);
router.get("/results/:id", getResults);
router.get("/candidate/:id", authMiddleware, getCandidateResults); // ✅ this is now safe

module.exports = router;
