const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");

exports.getAllVoteLogs = async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate("user", "username email")
      .populate("candidate", "name position")
      .populate("election", "title");

    const logs = votes.map((v) => ({
      user: v.user?.username || "Unknown",
      email: v.user?.email || "N/A",
      candidate: v.candidate?.name || "N/A",
      position: v.candidate?.position || "",
      election: v.election?.title || "Unknown",
      date: v.createdAt.toISOString(),
    }));

    res.status(200).json(logs);
  } catch (err) {
    console.error("Vote log fetch error:", err);
    res.status(500).json({ message: "Failed to fetch vote logs" });
  }
};
