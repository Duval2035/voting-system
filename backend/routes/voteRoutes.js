const express = require('express');
const router = express.Router();
const { castVote } = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/votes
// @desc    Cast a vote
// @access  Private
router.post('/', protect, castVote);

module.exports = router;
