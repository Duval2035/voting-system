const mongoose = require('mongoose');

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
