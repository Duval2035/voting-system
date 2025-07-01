const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/voting-system");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err);
  }
};

module.exports = connectDB;