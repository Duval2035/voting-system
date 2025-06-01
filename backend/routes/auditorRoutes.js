const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getAuditData } = require("../controllers/auditorController");

router.get("/logs", authMiddleware, getAuditData);

module.exports = router;
