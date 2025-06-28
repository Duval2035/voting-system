const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String },
  bio: { type: String },
  image: { type: String },
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  blockchainId: { type: Number, required: true },
});

module.exports = mongoose.model("Candidate", CandidateSchema);


