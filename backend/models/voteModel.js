const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  election: mongoose.Schema.Types.ObjectId,
  candidate: mongoose.Schema.Types.ObjectId,
  voter: mongoose.Schema.Types.ObjectId,
  tenantId: mongoose.Schema.Types.ObjectId,
});

const voteSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    candidates: [
      {
        name: { type: String, required: true },
        votes: { type: Number, default: 0 },
      },
    ],
    deadline: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    voters: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
