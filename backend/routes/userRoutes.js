// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { getUsers, getUserById } = require("../controllers/userController");

// Example route to get all users
router.get("/", getUsers);

// Example route to get user by ID
router.get("/:id", getUserById);

module.exports = router;
