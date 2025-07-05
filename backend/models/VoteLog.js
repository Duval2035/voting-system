const mongoose = require("mongoose");

const voteLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  timestamp: { type: Date, required: true },
  hash: { type: String, required: true },
  txHash: { type: String }, 
});

module.exports = mongoose.model("VoteLog", voteLogSchema);
