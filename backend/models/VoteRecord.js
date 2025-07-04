// backend/models/VoteRecord.js

const mongoose = require("mongoose");

const voteRecordSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // or null if anonymous
  },
  electionId: {
    type: String,
    required: true,
  },
  candidateId: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("VoteRecord", voteRecordSchema);
