const express = require('express');
const router = express.Router();
const { submitVote, getVotesByElection } = require('../controllers/voteController');

// Submit a vote
router.post('/', submitVote);

// Get all votes for a specific election
router.get('/:electionId', getVotesByElection);

module.exports = router;
