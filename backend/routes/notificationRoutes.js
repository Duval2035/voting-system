// backend/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();

// Dummy route for testing
router.get("/", (req, res) => {
  res.json({ message: "Notifications route working!" });
});

module.exports = router;
