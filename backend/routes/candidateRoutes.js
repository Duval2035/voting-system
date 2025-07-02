const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  addCandidate,
  addOrUpdateCandidate,
  getCandidatesByElection,
  getCandidatesByElectionDB,
  getCandidatesByElectionBlockchain,
  getCandidateById,
  deleteCandidate,
} = require("../controllers/candidateController");

const { protectAdmin } = require("../middleware/authMiddleware");

// 📦 Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage });
router.use((req, res, next) => {
  console.log("Admin Route hit:", req.method, req.originalUrl);
  next();
});

// 🔐 Admin protected create
router.post("/", protectAdmin, upload.single("image"), addCandidate);

// 🔁 Add or update (same controller function)
router.put("/:candidateId/:id", protectAdmin, upload.single("image"), addOrUpdateCandidate);
// candidateRoutes.js

router.get("/election/:electionId", getCandidatesByElection);

// 📥 Get from MongoDB
router.get("/election/db/:electionId", getCandidatesByElectionDB);

// 🔗 Get from Blockchain
router.get("/election/blockchain/:electionId", getCandidatesByElectionBlockchain);

// 📍 Get by candidate ID
router.get("/:id", getCandidateById);

// ❌ Delete candidate
router.delete("/:id", protectAdmin, deleteCandidate);

module.exports = router;
