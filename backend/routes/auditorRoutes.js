// routes/auditorRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAuditorElections,
  checkIntegrity,
} = require("../controllers/auditorController");
const { getAuditorElections, checkElectionIntegrity } = require("../controllers/auditorController");

router.get("/elections", authMiddleware, getAuditorElections);
router.get("/integrity/:electionId", authMiddleware, checkIntegrity);

module.exports = router;


