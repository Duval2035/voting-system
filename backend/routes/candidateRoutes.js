const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  addOrUpdateCandidate,
  getCandidatesByElectionDB,
  getCandidatesByElectionBlockchain,
  getCandidateById,
  deleteCandidate,
} = require("../controllers/candidateController");

// Add or update candidate (image optional)
router.post("/:id", upload.single("image"), addOrUpdateCandidate);           // Add new candidate
router.put("/:id/:candidateId", upload.single("image"), addOrUpdateCandidate); // Update existing candidate

// Get candidates from MongoDB
router.get("/election/:electionId/db", getCandidatesByElectionDB);

// Get candidates from Blockchain
router.get("/election/:electionId/blockchain", getCandidatesByElectionBlockchain);

// Get single candidate by ID
router.get("/:id", getCandidateById);

// Delete candidate by ID
router.delete("/:id", deleteCandidate);

module.exports = router;
