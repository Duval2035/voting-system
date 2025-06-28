const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  subject: String,
  content: String,
  recipients: [String],
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
