// backend/routes/electionRoutes.js
const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');
const electionController = require('../controllers/electionController');
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

router.post('/send-otp', authController.sendOtpToEmail);
router.post('/verify-otp', authController.verifyOtp);
router.post('/register', authController.register);

module.exports = router;
