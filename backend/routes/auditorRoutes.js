const express = require("express");
const router = express.Router();
const { protectUser } = require("../middleware/authMiddleware"); // ✅ use correct middleware

const {
  getAuditorElections,
  getElectionIntegrity,
} = require("../controllers/auditorController");

// Use protectUser (or protectAdmin if auditors are admins)
router.get("/elections", protectUser, getAuditorElections);
router.get("/integrity/:electionId", protectUser, getElectionIntegrity);

module.exports = router;
