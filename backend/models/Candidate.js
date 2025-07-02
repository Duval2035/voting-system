// backend/models/Candidate.js
const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String },
  bio: { type: String },
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  image: { type: String },
  blockchainId: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);
