const Vote = require("../models/Vote");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const User = require("../models/User");

exports.getAuditData = async (req, res) => {
  try {
    const elections = await Election.find();
    const votes = await Vote.find().populate("user candidate election");

    const logs = votes.map(vote => ({
      user: vote.user?.email,
      candidate: vote.candidate?.name,
      position: vote.candidate?.position,
      election: vote.election?.title,
      votedAt: vote.createdAt,
    }));

    res.json({ elections, logs });
  } catch (err) {
    console.error("Audit fetch error:", err);
    res.status(500).json({ message: "Failed to load audit data" });
  }
};
