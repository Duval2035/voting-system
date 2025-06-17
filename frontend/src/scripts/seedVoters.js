require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Voter = require("../models/Voter");
const Election = require("../models/Election");

// ✅ Connect to DB
async function seedVoters() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/your-db-name");

    // ✅ Find one election to assign voters to
    const election = await Election.findOne();
    if (!election) {
      console.log("❌ No elections found. Please create one first.");
      return;
    }

    console.log("🎯 Using election:", election.title);

    const votersToCreate = 10;

    for (let i = 1; i <= votersToCreate; i++) {
      // 🧑 Create test user
      const user = new User({
        name: `Test Voter ${i}`,
        email: `voter${i}@example.com`,
        password: "password123", // Or hash this if your model requires it
        role: "voter"
      });

      await user.save();

      // 🗳️ Register user as a voter
      const voter = new Voter({
        userId: user._id,
        electionId: election._id,
        createdAt: new Date()
      });

      await voter.save();

      console.log(`✅ Voter ${user.name} created and assigned to ${election.title}`);
    }

    console.log("🎉 Voter seeding complete!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    mongoose.disconnect();
  }
}

seedVoters();
