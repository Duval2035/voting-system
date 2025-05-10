const asyncHandler = require('express-async-handler');
const Vote = require('../models/voteModel');
const Poll = require('../models/pollModel');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private
const castVote = asyncHandler(async (req, res) => {
  const { pollId, option } = req.body;

  if (!pollId || !option) {
    res.status(400);
    throw new Error('Poll ID and option are required');
  }

  const poll = await Poll.findById(pollId);
  if (!poll) {
    res.status(404);
    throw new Error('Poll not found');
  }

  // Prevent duplicate voting
  const existingVote = await Vote.findOne({ pollId, voter: req.user._id });
  if (existingVote) {
    res.status(400);
    throw new Error('You have already voted in this poll');
  }

  const vote = await Vote.create({
    pollId,
    option,
    voter: req.user._id,
  });

  res.status(201).json(vote);
});

module.exports = {
  castVote,
};
