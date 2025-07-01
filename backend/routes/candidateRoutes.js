const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  addOrUpdateCandidate,
  getCandidatesByElectionDB,
  getCandidateById,
  deleteCandidate,
} = require("../controllers/candidateController");

// Get all candidates for a given election (MongoDB)
router.get("/election/:electionId", getCandidatesByElectionDB);

// Add new candidate for election (POST to /candidates/:electionId)
router.post("/:id", upload.single("image"), addOrUpdateCandidate);

// Update candidate by candidate ID (PUT to /candidates/:id)
router.put("/:id", upload.single("image"), addOrUpdateCandidate);

// Get candidate by candidate ID
router.get("/:id", getCandidateById);

// Delete candidate by candidate ID
router.delete("/:id", deleteCandidate);

module.exports = router;
