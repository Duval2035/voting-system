const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  addCandidate,
  updateCandidate,
  getCandidatesByElection,
  getCandidateById,
  deleteCandidate,
} = require("../controllers/candidateController");

// Ensure upload directory exists
const uploadPath = path.join(__dirname, "../uploads/candidates");
fs.mkdirSync(uploadPath, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, webp) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Routes
router.post("/", upload.single("image"), addCandidate);
router.put("/:candidateId", upload.single("image"), updateCandidate);
router.get("/election/:electionId", getCandidatesByElection);
router.get("/:id", getCandidateById);
router.delete("/:id", deleteCandidate);

module.exports = router;
