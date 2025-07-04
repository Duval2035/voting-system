const mongoose = require("mongoose");

const voteRecordSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  voter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  blockchainId: { type: Number },
}, { timestamps: true });

module.exports = mongoose.models.VoteRecord || mongoose.model("VoteRecord", voteRecordSchema);
