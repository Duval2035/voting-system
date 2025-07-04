const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  addCandidate,
  addOrUpdateCandidate,
  getCandidatesByElection,
  getCandidateById,
  deleteCandidate,
} = require("../controllers/candidateController");
const { protectAdmin } = require("../middleware/authMiddleware");

// Setup multer storage for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/candidates/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Route: POST /candidates - Add new candidate (with image upload)
router.post("/", protectAdmin, upload.single("image"), addCandidate);

// Route: PUT /candidates/:candidateId - Update candidate (with optional image upload)
router.put("/:candidateId", protectAdmin, upload.single("image"), addOrUpdateCandidate);

// Route: GET /candidates/election/:electionId - Get candidates by election
router.get("/election/:electionId", getCandidatesByElection);

// Route: GET /candidates/:id - Get candidate by ID
router.get("/:id", getCandidateById);

// Route: DELETE /candidates/:id - Delete candidate
router.delete("/:id", protectAdmin, deleteCandidate);

module.exports = router;
