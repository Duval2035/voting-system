const express = require("express");
const router = express.Router();

const Election = require("../models/Election");
const Voter = require("../models/VoteRecord");
const User = require("../models/User");

const authenticateAdmin = require("../middleware/authenticateAdmin");
const authorizeRoles = require("../middleware/authorizeRoles");

const adminController = require("../controllers/adminController");

const {
  getEligibleVoters,
  assignVotersToElection,
  getVotersByElection,
  getAllVoters,
  exportVoteLogsCSV,
  assignAllUsersToElection,
} = adminController;

// ✅ Get all elections
router.get(
  "/elections",
  authenticateAdmin,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const elections = await Election.find({}, "_id title startDate endDate").lean();
      res.json(elections);
    } catch (err) {
      console.error("Failed to fetch elections:", err);
      res.status(500).json({ message: "Failed to fetch elections" });
    }
  }
);

// ✅ Get all voters
router.get(
  "/voters",
  authenticateAdmin,
  authorizeRoles("admin"),
  getAllVoters
);

// ✅ Get eligible voters
router.get(
  "/elections/:electionId/eligible-voters",
  authenticateAdmin,
  authorizeRoles("admin"),
  getEligibleVoters
);

// ✅ Assign specific voters
router.post(
  "/elections/:electionId/assign-voters",
  authenticateAdmin,
  authorizeRoles("admin"),
  assignVotersToElection
);

// ✅ Assign all users
router.post(
  "/assign-all/:electionId",
  authenticateAdmin,
  authorizeRoles("admin"),
  assignAllUsersToElection
);

// ✅ Get voters by election
router.get(
  "/voters-by-election/:electionId",
  authenticateAdmin,
  authorizeRoles("admin"),
  getVotersByElection
);

// ✅ Export vote logs
router.get(
  "/voters/export/:electionId",
  authenticateAdmin,
  authorizeRoles("admin"),
  exportVoteLogsCSV
);

// ✅ Add a new voter manually
router.post(
  "/add-voter",
  authenticateAdmin,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { email, electionId } = req.body;

      if (!email || !electionId) {
        return res.status(400).json({ message: "Email and electionId are required." });
      }

      const electionExists = await Election.findById(electionId);
      if (!electionExists) {
        return res.status(404).json({ message: "Election not found." });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const alreadyRegistered = await Voter.findOne({ email, election: electionId });
      if (alreadyRegistered) {
        return res.status(400).json({ message: "Voter already registered for this election." });
      }

      const newVoter = new Voter({
        name: user.username || user.name || "Unknown",
        email: user.email,
        election: electionId,
      });

      await newVoter.save();

      res.status(201).json({ message: "✅ Voter added successfully", voter: newVoter });
    } catch (err) {
      console.error("Error adding voter:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
