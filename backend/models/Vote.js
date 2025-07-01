const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Vote", voteSchema);
