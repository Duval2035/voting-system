const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 👨‍💼 Admin-only route
router.get("/admin/dashboard", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard", user: req.user });
});

// 🙋 Regular User route
router.get("/user/dashboard", authMiddleware, roleMiddleware("user"), (req, res) => {
  res.json({ message: "Welcome to the User Dashboard", user: req.user });
});

// 👁️ Auditor route
router.get("/auditor", authMiddleware, roleMiddleware("auditor"), (req, res) => {
  res.json({ message: "Welcome Auditor", user: req.user });
});

// 🧑‍💻 Candidate route
router.get("/candidate/dashboard", authMiddleware, roleMiddleware("candidate"), (req, res) => {
  res.json({ message: "Welcome Candidate", user: req.user });
});

// 🔒 Default protected route
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Authenticated route", user: req.user });
});

module.exports = router;
