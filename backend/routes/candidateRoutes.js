// backend/routes/candidateRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const {
  addOrUpdateCandidate,
  getCandidatesByElection,
  deleteCandidate
} = require("../controllers/candidateController");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Routes
router.get("/by-election/:electionId", getCandidatesByElection);
router.post("/:id", authMiddleware, upload.single("image"), addOrUpdateCandidate);
router.put("/:id/:candidateId", authMiddleware, upload.single("image"), addOrUpdateCandidate);
router.delete("/:id", authMiddleware, deleteCandidate);

module.exports = router;


