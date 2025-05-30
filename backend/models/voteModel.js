const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
    },
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    option: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
