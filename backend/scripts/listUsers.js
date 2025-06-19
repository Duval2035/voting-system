const mongoose = require("mongoose");
const User = require("../models/User"); // Adjust the path as needed
require("dotenv").config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // your MongoDB URI
    const allUsers = await User.find();
    console.log("All Users:", allUsers);
    mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    mongoose.disconnect();
  }
}

listUsers();
