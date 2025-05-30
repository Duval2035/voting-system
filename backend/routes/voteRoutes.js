// backend/routes/voteRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { submitVote } = require("../controllers/voteController");

router.post("/", auth, submitVote);

module.exports = router;
