const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const VoteLog = require("../models/VoteLog");
const Election = require("../models/Election");
const Voter = require("../models/Voter");

const authenticateAdmin = require("../middleware/authenticateAdmin");
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");

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
  getAvailableElections,
} = require("../controllers/electionController");

// Admin-only: get all elections
router.get("/admin/all", authenticateAdmin, getAllElectionsAdmin);

// Get elections for auditor (authenticated user)
router.get("/auditor/all", protectUser, getElectionsForAuditor);

// Get voters for a specific election (authenticated user)
router.get("/:id/voters", protectUser, getVotersByElection);

// Export voters assigned to an election (Admin only)
router.get("/:id/export-voters", authenticateAdmin, async (req, res) => {
  const electionId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(electionId)) {
    return res.status(400).json({ message: "Invalid election ID" });
  }

  try {
    const voters = await Voter.find({ election: electionId })
      .select("name email _id")
      .lean();

    if (!voters || voters.length === 0) {
      return res.status(404).json({ message: "No voters found for this election" });
    }

    res.setHeader("Content-Disposition", `attachment; filename=voters-${electionId}.json`);
    res.setHeader("Content-Type", "application/json");

    res.send(JSON.stringify(voters, null, 2));
  } catch (err) {
    console.error("Export voters error:", err);
    res.status(500).json({ message: "Failed to export voters" });
  }
});

// Export logs for an election (Admin only)
router.get("/export/:electionId", authenticateAdmin, async (req, res) => {
  const { electionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(electionId)) {
    return res.status(400).json({ message: "Invalid election ID" });
  }

  try {
    const logs = await VoteLog.find({ election: electionId })
      .select("voterId candidateId timestamp")
      .lean();

    if (!logs.length) {
      return res.status(404).json({ message: "No logs found for this election" });
    }

    res.setHeader("Content-Disposition", `attachment; filename=logs-${electionId}.json`);
    res.setHeader("Content-Type", "application/json");

    res.send(JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Failed to export logs:", err);
    res.status(500).json({ message: "Failed to export logs" });
  }
});

// Public route: Get available elections with status
router.get("/public/available", getAvailableElections);

// Get all elections (no filter) - open for candidates (or public)
router.get("/candidate/elections", async (req, res) => {
  try {
    const elections = await Election.find({});
    res.json(elections);
  } catch (error) {
    console.error("Failed to fetch elections:", error);
    res.status(500).json({ message: "Server error fetching elections" });
  }
});

// Election details - protected user
router.get("/:id", protectUser, getElectionById);

// Update election status - protected user
router.patch("/:id/status", protectUser, updateElectionStatus);

// Update election details - protected user
router.patch("/:id", protectUser, updateElection);

// Delete election - protected user
router.delete("/:id", protectUser, deleteElection);

// Get elections by organization - protected user
router.get("/", protectUser, getElectionsByOrganization);

// Create new election - protected user
router.post("/", protectUser, createElection);

module.exports = router;
