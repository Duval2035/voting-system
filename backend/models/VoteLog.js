// backend/models/VoteLog.js
const mongoose = require("mongoose");

const voteLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election" },
  timestamp: { type: Date, default: Date.now },
  hash: { type: String, required: true },
});

module.exports = mongoose.model("VoteLog", voteLogSchema);
