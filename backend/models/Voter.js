const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Voter", voterSchema);
