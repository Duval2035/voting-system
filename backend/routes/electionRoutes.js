const express = require("express");
const router = express.Router();
const VoteLog = require("../models/VoteLog");
const mongoose = require("mongoose");
const Election = require("../models/Election");
const Voter = require("../models/Voter");
const User = require("../models/User");

const authenticateAdmin = require("../middleware/authenticateAdmin");
const auth = require("../middleware/authMiddleware");

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

// Get elections for auditor
router.get("/auditor/all", auth, getElectionsForAuditor);

// Get voters for a specific election
router.get("/:id/voters", auth, getVotersByElection);

// Export voters assigned to an election (Admin only)
router.get("/:id/export-voters", authenticateAdmin, async (req, res) => {
  const electionId = req.params.id;
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

// Export logs for an election
router.get("/export/:electionId", authenticateAdmin, async (req, res) => {
  const { electionId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ message: "Invalid election ID" });
    }

    const logs = await VoteLog.find({ election: electionId })
      .select("voterId candidateId timestamp") // adjust fields as needed
      .lean();

    if (!logs.length) {
      return res.status(404).json({ message: "No logs found for this election" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=logs-${electionId}.json`
    );
    res.setHeader("Content-Type", "application/json");

    res.send(JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Failed to export logs:", err);
    res.status(500).json({ message: "Failed to export logs" });
  }
});

router.get("/public/available", async (req, res) => {
  try {
    const elections = await Election.find({});
    res.json(elections);
  } catch (err) {
    console.error("Error fetching elections:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/candidate/elections", async (req, res) => {
  try {
    const elections = await Election.find({}); 
    res.json(elections);
  } catch (error) {
    console.error("Failed to fetch elections:", error);
    res.status(500).json({ message: "Server error fetching elections" });
  }
});
// Get election by ID

router.get("/:id", auth, getElectionById);

// Update election status
router.patch("/:id/status", auth, updateElectionStatus);

// Update election
router.patch("/:id", auth, updateElection);

// Delete election
router.delete("/:id", auth, deleteElection);

// Get elections by organization
router.get("/", auth, getElectionsByOrganization);

// Create new election
router.post("/", auth, createElection);

// Public: available elections
router.get("/public/available", getAvailableElections);

module.exports = router;
