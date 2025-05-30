// backend/routes/electionRoutes.js
const express = require("express");
const router = express.Router();

const {
  createElection,
  getElectionsByOrganization,
  getElectionById,
  updateElectionStatus,
} = require("../controllers/electionController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createElection);
router.get("/", authMiddleware, getElectionsByOrganization);
router.get("/:id", authMiddleware, getElectionById);
router.patch("/:id/status", authMiddleware, updateElectionStatus);

module.exports = router;
