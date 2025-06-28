const express = require("express");
const router = express.Router();

const {
  createElection,
  getElectionsByOrganization,
  getElectionById,
  updateElectionStatus,
  updateElection,
  deleteElection,
  getElectionsForAuditor,
  getVotersByElection,
  getAllElectionsAdmin,
} = require("../controllers/electionController");

const auth = require("../middleware/authMiddleware");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// Admin-only: get all elections (put this before /:id route)
router.get("/admin/all", authenticateAdmin, getAllElectionsAdmin);

// Get elections for auditor (also before /:id)
router.get("/auditor/all", auth, getElectionsForAuditor);

// Get voters for a specific election (before /:id)
router.get("/:id/voters", auth, getVotersByElection);

// Get election by ID
router.get("/:id", auth, getElectionById);

// Update election status
router.patch("/:id/status", auth, updateElectionStatus);

// Update election (full patch)
router.patch("/:id", auth, updateElection);

// Delete an election
router.delete("/:id", auth, deleteElection);

// Get elections tied to user's organization
router.get("/", auth, getElectionsByOrganization);

// Create election (requires token)
router.post("/", auth, createElection);

module.exports = router;
