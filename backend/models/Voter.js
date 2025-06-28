// models/Voter.js
const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  createdAt: { type: Date, default: Date.now },
  hasVoted: { type: Boolean, default: false },
});

// ✅ Composite index to allow same email in different elections
voterSchema.index({ email: 1, election: 1 }, { unique: true });

module.exports = mongoose.model("Voter", voterSchema);
