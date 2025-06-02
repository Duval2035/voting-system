// backend/routes/auditorRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getAllElections } = require("../controllers/auditorController");

router.get("/elections", authMiddleware, getAllElections);

module.exports = router;
