const Voter = require("../models/Voter");
const User = require("../models/User");
const Election = require("../models/Election");
const VoteLog = require("../models/VoteLog");
const {
  submitVote,
  getResults,
  getCandidateResults,
  getVoteLogs,
  exportVoteLogsCSV,
  getVotesByElection,
  getElectionResults,
} = require("./voteController");

// ✅ Get voters assigned to a specific election
const getVotersByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const voters = await Voter.find({ election: electionId });

    if (!voters || voters.length === 0) {
      return res.status(404).json({ message: "❌ No voters found for this election." });
    }

    res.json(voters);
  } catch (err) {
    console.error("❌ Error fetching voters:", err);
    res.status(500).json({ message: "Server error fetching voters." });
  }
};

// ✅ Get all users with role "user"
const getAllVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: "user" }).select("username email organizationName");
    
    return res.status(200).json({ voters });
  } catch (err) {
    console.error("❌ Error fetching all voters:", err);
    return res.status(500).json({ message: "Failed to fetch voters." });
  }
};

// ✅ Get eligible voters (users not yet assigned to this election)
const getEligibleVoters = async (req, res) => {
  try {
    const { electionId } = req.params;

    const assignedVoters = await Voter.find({ election: electionId }).select("email");
    const assignedEmails = assignedVoters.map(v => v.email);

    const eligibleVoters = await User.find({
      role: "user",
      email: { $nin: assignedEmails }
    }).select("username email _id");

    return res.json({ eligibleVoters });
  } catch (err) {
    console.error("❌ Error getting eligible voters:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Assign selected voters to an election using voterIds (from frontend)
const assignVotersToElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { voterIds } = req.body;

    if (!Array.isArray(voterIds) || voterIds.length === 0) {
      return res.status(400).json({ message: "No voter IDs provided." });
    }

    // Fetch users by IDs
    const users = await User.find({ _id: { $in: voterIds }, role: "user" });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No valid users found." });
    }

    const operations = users.map(user =>
      Voter.updateOne(
        { email: user.email, election: electionId },
        {
          $setOnInsert: {
            name: user.username || user.name || "Unknown",
            email: user.email,
            election: electionId,
          },
        },
        { upsert: true }
      )
    );

    await Promise.all(operations);

    res.status(200).json({ message: "✅ Selected voters assigned successfully." });
  } catch (err) {
    console.error("❌ Manual voter assignment failed:", err);
    res.status(500).json({ message: "Failed to assign voters." });
  }
};

// ✅ Bulk assign all users to election
const assignAllUsersToElection = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    const { electionId } = req.params;

    const operations = users.map(user =>
      Voter.updateOne(
        { email: user.email, election: electionId },
        {
          $setOnInsert: {
            name: user.username || user.name || "Unnamed",
            email: user.email,
            election: electionId,
          },
        },
        { upsert: true }
      )
    );

    await Promise.all(operations);

    res.status(200).json({ message: "✅ All users assigned as voters successfully." });
  } catch (err) {
    console.error("❌ Bulk assignment failed:", err);
    res.status(500).json({ message: "Failed to assign voters." });
  }
};

module.exports = {
  getVotersByElection,
  getAllVoters,
  getEligibleVoters,
  assignVotersToElection,
  assignAllUsersToElection,
  submitVote,
  getResults,
  getCandidateResults,
  getVoteLogs,
  exportVoteLogsCSV,
  getVotesByElection,
  getElectionResults
};
