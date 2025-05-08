// models/Election.js
const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  organizationName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.Election || mongoose.model("Election", electionSchema);
