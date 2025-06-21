const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  subject: String,
  content: String,
  recipients: [String],
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
