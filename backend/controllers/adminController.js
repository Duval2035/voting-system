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

    // ✅ Only ONE response sent
    return res.json({
      totalVoters: voters.length,
      voters,
    });
  } catch (err) {
    console.error("❌ Error fetching voters by election:", err);
    return res.status(500).json({ message: "Failed to fetch voters for this election." });
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

// Get voters assigned to an election
const getVotersByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).populate("voterIds", "name email");
    if (!election) return res.status(404).json({ message: "Election not found" });
    res.json({ voters: election.voterIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all voters
const getAllVoters = async (req, res) => {
  try {
    const voters = await Voter.find({}, "name email election").populate("election", "title");
    res.json({ voters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get eligible voters (not yet assigned to the election)
const getEligibleVoters = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).populate("voterIds", "_id");
    const assignedIds = election?.voterIds.map((v) => v._id.toString()) || [];
    const eligibleVoters = await Voter.find({ _id: { $nin: assignedIds } });
    res.json({ eligibleVoters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Assign a list of voters to an election
const assignVotersToElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { voterIds } = req.body;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    election.voterIds = [...new Set([...election.voterIds.map(id => id.toString()), ...voterIds])];
    await election.save();
    res.status(200).json({ message: "Voters assigned successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { getEligibleVoters,
  assignVotersToElection,
  getVotersByElection,
  getAllVoters,};


