// backend/routes/electionRoutes.js

const express = require('express');
const router = express.Router();
const {
  createElection,
  getAllElections,
  getElectionById,
  getElectionsByOrg
} = require('../controllers/electionController');

const authMiddleware = require('../middleware/authMiddleware');

// Create a new election (admin only)
router.post('/', authMiddleware, createElection);

// Get all elections (admin view)
router.get('/', authMiddleware, getAllElections);

// Get all elections for the logged-in user's organization (user view)
router.get('/organization', authMiddleware, getElectionsByOrg);

// Get one election by ID
router.get('/:id', authMiddleware, getElectionById);

module.exports = router;
