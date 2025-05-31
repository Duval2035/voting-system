// backend/routes/candidateRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  addCandidate,
  getCandidatesByElection,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");

const authMiddleware = require("../middleware/authMiddleware");

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Routes
router.get("/by-election/:electionId", getCandidatesByElection);
router.post("/:id", authMiddleware, upload.single("image"), addCandidate);
router.put("/:electionId/:id", authMiddleware, upload.single("image"), updateCandidate);
router.delete("/:id", authMiddleware, deleteCandidate);

module.exports = router;
