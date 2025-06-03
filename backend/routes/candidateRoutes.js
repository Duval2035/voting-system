const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  addOrUpdateCandidate,
  getCandidatesByElection,
  deleteCandidate,
} = require("../controllers/candidateController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});


const upload = multer({ storage });

router.get("/by-election/:electionId", getCandidatesByElection);
router.post("/:id", authMiddleware, upload.single("image"), addOrUpdateCandidate);
router.put("/:id/:candidateId", authMiddleware, upload.single("image"), addOrUpdateCandidate);
router.delete("/:id", authMiddleware, deleteCandidate);

module.exports = router;

