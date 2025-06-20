const Vote = require("../models/Voter");
const User = require("../models/User");
const Election = require("../models/Election");

// ✅ Get all voters for a specific election (with total count)
exports.getVotersByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId).populate("voterIds", "username email");

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const voters = election.voterIds;
   res.json({ voters: election.voterIds });

    res.json({
      totalVoters: voters.length,
      voters,
    });
  } catch (err) {
    console.error("❌ Error fetching voters by election:", err);
    res.status(500).json({ message: "Failed to fetch voters for this election." });
  }
};

// ✅ Get all users with role "user" (aka voters globally)
exports.getAllVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: "user" }).select("-password");
    res.json(voters);
  } catch (err) {
    console.error("❌ Error fetching all voters:", err);
    res.status(500).json({ message: "Failed to fetch voters." });
  }
};
