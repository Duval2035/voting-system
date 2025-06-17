const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  bio: { type: String, required: true },
  image: { type: String },
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election" },
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);

