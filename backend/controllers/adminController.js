// controllers/adminController.js
const Vote = require("../models/Voter");
const User = require("../models/User");

exports.getVotersByElection = async (req, res) => {
  try {
    const electionId = req.params.electionId;

    // Find distinct users who voted in this election
    const voters = await Vote.find({ election: electionId }).populate("user", "username email");

    const formatted = voters.map((v) => ({
      username: v.user?.username,
      email: v.user?.email,
      votedAt: v.createdAt,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("❌ Error fetching voters:", err);
    res.status(500).json({ message: "Error fetching voters for election." });
  }
};


exports.getAllVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: "user" }).select("-password"); 
    res.json(voters);
  } catch (err) {
    console.error("Error fetching voters:", err);
    res.status(500).json({ message: "Failed to fetch voters." });
  }
};
