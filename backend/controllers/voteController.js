const asyncHandler = require('express-async-handler');
const Vote = require('../models/voteModel');

// @desc    Create a new vote
// @route   POST /api/votes
// @access  Private
const createVote = asyncHandler(async (req, res) => {
  const { title, description, candidates, deadline } = req.body;

  if (!title || !candidates || candidates.length < 2 || !deadline) {
    res.status(400);
    throw new Error('Please provide title, at least 2 candidates, and deadline');
  }

  const vote = await Vote.create({
    title,
    description,
    candidates,
    deadline,
    createdBy: req.user._id,
  });

  res.status(201).json(vote);
});

// @desc    Get all votes
// @route   GET /api/votes
// @access  Public
const getVotes = asyncHandler(async (req, res) => {
  const votes = await Vote.find({});
  res.json(votes);
});

// @desc    Get single vote
// @route   GET /api/votes/:id
// @access  Public
const getVoteById = asyncHandler(async (req, res) => {
  const vote = await Vote.findById(req.params.id);
  if (vote) {
    res.json(vote);
  } else {
    res.status(404);
    throw new Error('Vote not found');
  }
});

// @desc    Cast a vote
// @route   POST /api/votes/:id/vote
// @access  Private
const castVote = asyncHandler(async (req, res) => {
  const { candidateName } = req.body;
  const vote = await Vote.findById(req.params.id);

  if (!vote) {
    res.status(404);
    throw new Error('Vote not found');
  }

  // Check if deadline passed
  if (new Date() > new Date(vote.deadline)) {
    res.status(400);
    throw new Error('Voting has ended');
  }

  // Check if user already voted
  const alreadyVoted = vote.voters.some(
    (voter) => voter.userId.toString() === req.user._id.toString()
  );

  if (alreadyVoted) {
    res.status(400);
    throw new Error('You have already voted');
  }

  const candidate = vote.candidates.find((c) => c.name === candidateName);
  if (!candidate) {
    res.status(404);
    throw new Error('Candidate not found');
  }

  candidate.votes += 1;
  vote.voters.push({ userId: req.user._id });
  await vote.save();

  res.json({ message: 'Vote cast successfully' });
});

module.exports = {
  createVote,
  getVotes,
  getVoteById,
  castVote,
};
