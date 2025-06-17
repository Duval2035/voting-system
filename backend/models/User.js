const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  organizationName: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["admin", "user", "auditor", "candidate"],
    default: "user",
  },
  otp: String,
  otpExpires: Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
