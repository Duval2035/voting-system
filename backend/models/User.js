const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  organizationName: { type: String, required: true },
 role: { type: String, enum: ["user", "admin", "candidate", "auditor"], default: "user" },
 
});

module.exports = mongoose.model("User", userSchema);
