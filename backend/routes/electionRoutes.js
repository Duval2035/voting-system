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


module.exports = router;
