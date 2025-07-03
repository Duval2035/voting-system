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

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage });

router.use((req, res, next) => {
  console.log("Admin Route hit:", req.method, req.originalUrl);
  next();
});

router.post("/", protectAdmin, upload.single("image"), addCandidate);
router.put("/:candidateId/update/:updateId", protectAdmin, upload.single("image"), addOrUpdateCandidate);
router.get("/election/:electionId", getCandidatesByElection);
router.get("/election/db/:electionId", getCandidatesByElectionDB);
router.get("/election/blockchain/:electionId", getCandidatesByElectionBlockchain);
router.get("/:id", getCandidateById);
router.delete("/:id", protectAdmin, deleteCandidate);

module.exports = router;
