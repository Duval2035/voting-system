// backend/routes/candidateRoutes.js

const express = require('express');
const router = express.Router();
const { addCandidate, getCandidatesByElection } = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');

// Add candidate to an election
router.post('/:id', authMiddleware, addCandidate);

// Get all candidates for a specific election
router.get('/by-election/:electionId', getCandidatesByElection);

module.exports = router;
