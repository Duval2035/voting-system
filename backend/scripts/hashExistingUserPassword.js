// scripts/hashExistingUserPassword.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

async function hashPassword() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "user@example.com";
  const user = await User.findOne({ email });

  if (!user) {
    console.log("User not found");
    return;
  }

  const isAlreadyHashed = user.password.startsWith("$2");
  if (!isAlreadyHashed) {
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    console.log("Password hashed successfully");
  } else {
    console.log("Password already hashed");
  }

  mongoose.disconnect();
}

hashPassword();
    