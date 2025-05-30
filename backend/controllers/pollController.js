const asyncHandler = require('express-async-handler');
const Poll = require('../models/voteModel');

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Public (or protected based on your design)
const createPoll = asyncHandler(async (req, res) => {
  const { question, options } = req.body;

  if (!question || !options || options.length < 2) {
    res.status(400);
    throw new Error('Poll must have a question and at least two options');
  }

  const poll = new Poll({
    question,
    options: options.map(option => ({ text: option })),
  });

  const createdPoll = await poll.save();
  res.status(201).json(createdPoll);
});

// @desc    Get all polls
// @route   GET /api/polls
// @access  Public
const getPolls = asyncHandler(async (req, res) => {
  const polls = await Poll.find({});
  res.json(polls);
});

// @desc    Vote on a poll
// @route   POST /api/polls/:id/vote
// @access  Public
const votePoll = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);

  if (!poll) {
    res.status(404);
    throw new Error('Poll not found');
  }

  const { optionIndex } = req.body;

  if (
    typeof optionIndex !== 'number' ||
    optionIndex < 0 ||
    optionIndex >= poll.options.length
  ) {
    res.status(400);
    throw new Error('Invalid option selected');
  }

  poll.options[optionIndex].votes += 1;
  const updatedPoll = await poll.save();

  res.json(updatedPoll);
});

module.exports = { createPoll, getPolls, votePoll };
