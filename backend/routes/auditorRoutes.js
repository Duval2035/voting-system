// backend/routes/auditorRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAuditorElections,
  getElectionIntegrity,
} = require("../controllers/auditorController");

router.get("/elections", authMiddleware, getAuditorElections);
router.get("/integrity/:electionId", authMiddleware, getElectionIntegrity);


module.exports = router;
