// routes/electionRoutes.js
const express = require("express");
const router = express.Router();
const {
  createElection,
  getElectionsByOrganization,
  getElectionById,
  updateElectionStatus,
} = require("../controllers/electionController");
const authMiddleware = require("../middleware/authMiddleware");
const { getElectionsForAuditor } = require('../controllers/electionController');
const { getVotersByElection } = require("../controllers/electionController");
const Election = require('../models/Election');
const authenticateAdmin = require("../middleware/authenticateAdmin");


router.get("/admin/elections", authenticateAdmin, getElectionsByOrganization);
router.get("/admin/elections/:id", authenticateAdmin, getElectionById);
router.post("/", authMiddleware, createElection);
router.get("/", authMiddleware, getElectionsByOrganization);
router.get("/:id", authMiddleware, getElectionById);
router.patch("/:id/status", authMiddleware, updateElectionStatus);
router.get('/auditor', authMiddleware, getElectionsForAuditor);
router.get("/elections/:id/voters", authMiddleware, getVotersByElection);
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedElection = await Election.findByIdAndDelete(id);
    if (!deletedElection) return res.status(404).json({ message: "Election not found" });
    res.status(200).json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error("Delete Election Error:", error);
    res.status(500).json({ message: "Failed to delete election" });
  }
});
// GET /api/elections
router.get("/", async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: -1 });
    res.status(200).json(elections);
  } catch (error) {
    console.error("❌ Error fetching elections:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// POST /api/elections
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newElection = new Election({
      title,
      description,
      startDate,
      endDate,
      organizationName: req.user.organizationName,
    });

    await newElection.save();
    res.status(201).json(newElection);
  } catch (error) {
    console.error("❌ Error creating election:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;
