const mongoose = require('mongoose');

const pollSchema = mongoose.Schema({
  title: { type: String, required: true },
  options: [{ type: String, required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poll', pollSchema);
