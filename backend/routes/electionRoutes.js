const express = require("express");
const router = express.Router();

const {
  createElection,
  getElectionsByOrganization,
  getElectionById,
  updateElectionStatus,
  getElectionsForAuditor,
  getVotersByElection,
  deleteElection
} = require("../controllers/electionController");

const Election = require("../models/Election");
const auth = require("../middleware/authMiddleware");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// ✅ Create a new election
router.post("/", auth, createElection);

// ✅ Get all elections (admin or organization-specific)
router.get("/", auth, getElectionsByOrganization);

// ✅ Get election by ID
router.get("/:id", auth, getElectionById);

// ✅ Update election status
router.patch("/:id/status", auth, updateElectionStatus);

// ✅ Delete an election
router.delete("/:id", auth, deleteElection);

// ✅ Get all elections for auditor
router.get("/auditor/all", auth, getElectionsForAuditor);

// ✅ Get voters for an election
router.get("/:id/voters", auth, getVotersByElection);

// ✅ (Optional) Admin-only route to fetch all elections globally
router.get("/admin/all", authenticateAdmin, async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: -1 });
    res.status(200).json(elections);
  } catch (error) {
    console.error("Error fetching elections:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
});

module.exports = router;
