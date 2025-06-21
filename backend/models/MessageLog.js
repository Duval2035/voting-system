const mongoose = require("mongoose");

const messageLogSchema = new mongoose.Schema({
  subject: String,
  content: String,
  recipients: [String],
  sentAt: { type: Date, default: Date.now },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
});

module.exports = mongoose.model("MessageLog", messageLogSchema);
