const express = require("express");
const router = express.Router();
const {
  addCandidate,
  addOrUpdateCandidate,
  getCandidatesByElection,
  getCandidateById,
  deleteCandidate,
} = require("../controllers/candidateController");
const { protectAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploads"); // Shared multer

router.post("/", protectAdmin, upload.single("image"), addCandidate);
router.put("/:candidateId", protectAdmin, upload.single("image"), addOrUpdateCandidate);
router.get("/election/:electionId", getCandidatesByElection);
router.get("/:id", getCandidateById);
router.delete("/:id", protectAdmin, deleteCandidate);

module.exports = router;
