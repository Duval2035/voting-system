// routes/auditorRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getElections } = require("../controllers/auditorController");

// GET /api/auditor/elections
router.get("/elections", authMiddleware, getElections);

module.exports = router;
