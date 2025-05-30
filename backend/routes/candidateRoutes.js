// backend/routes/candidateRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  addCandidate,
  getCandidatesByElection,
  updateCandidate,
  deleteCandidate
} = require("../controllers/candidateController");

router.post("/:id", auth, addCandidate);
router.get("/by-election/:electionId", getCandidatesByElection);
router.put("/:id/:candidateId", auth, updateCandidate);
router.delete("/:candidateId", auth, deleteCandidate);

module.exports = router;
