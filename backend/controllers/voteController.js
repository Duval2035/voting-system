const crypto = require("crypto");
const mongoose = require("mongoose");
const Voter = require("../models/Voter");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const VoteLog = require("../models/VoteLog");
const { Parser } = require("json2csv");

// 1. Submit vote and generate log
exports.submitVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user.userId || req.user.id; // accommodate both

  if (!electionId || !candidateId) {
    return res.status(400).json({ message: "Election ID and Candidate ID are required." });
  }

  try {
    const alreadyVoted = await Vote.findOne({ election: electionId, user: userId });
    if (alreadyVoted) {
      return res.status(400).json({ message: "You already voted in this election." });
    }

    const vote = new Vote({ election: electionId, candidate: candidateId, user: userId });
    await vote.save();

    const timestamp = new Date();
    const hashString = `${userId}-${electionId}-${candidateId}-${timestamp.toISOString()}`;
    const hash = crypto.createHash("sha256").update(hashString).digest("hex");

    const log = new VoteLog({ user: userId, election: electionId, timestamp, hash });
    await log.save();

    res.status(200).json({ message: "✅ Vote submitted and logged successfully." });
  } catch (error) {
    console.error("❌ Vote submission error:", error);
    res.status(500).json({ message: "Failed to submit vote." });
  }
};

// 2. Get real-time results by election ID (returns tally per candidate)
exports.getResults = async (req, res) => {
  try {
    const electionId = req.params.id || req.params.electionId;
    const votes = await Vote.find({ election: electionId }).populate("candidate");

    const tally = {};

    for (const vote of votes) {
      const cid = vote.candidate._id.toString();
      if (!tally[cid]) {
        tally[cid] = {
          _id: vote.candidate._id,
          name: vote.candidate.name,
          position: vote.candidate.position,
          image: vote.candidate.image,
          votes: 1,
        };
      } else {
        tally[cid].votes++;
      }
    }

    res.json(Object.values(tally));
  } catch (err) {
    console.error("Failed to fetch results:", err);
    res.status(500).json({ message: "Error fetching results" });
  }
};

// 3. Get candidate-specific results by user ID
exports.getCandidateResults = async (req, res) => {
  try {
    const userId = req.params.id;
    const candidate = await Candidate.findOne({ userId });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const votes = await Vote.find({ candidate: candidate._id });

    res.json({
      _id: candidate._id,
      name: candidate.name,
      position: candidate.position,
      image: candidate.image,
      votes: votes.length,
    });
  } catch (err) {
    console.error("Candidate result error:", err);
    res.status(500).json({ message: "Error fetching candidate results" });
  }
};

// 4. Get vote logs for an election
exports.getVoteLogs = async (req, res) => {
  try {
    const { electionId } = req.params;
    const logs = await VoteLog.find({ election: electionId })
      .populate("user", "username email")
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error("Vote log fetch error:", error);
    res.status(500).json({ message: "Error fetching vote logs" });
  }
};

// 5. Export vote logs as CSV
exports.exportVoteLogsCSV = async (req, res) => {
  try {
    const { electionId } = req.params;
    const logs = await VoteLog.find({ election: electionId }).populate("user", "username email");

    if (!logs.length) {
      return res.status(404).json({ message: "No vote logs to export." });
    }

    const formatted = logs.map(log => ({
      username: log.user?.username || "N/A",
      email: log.user?.email || "N/A",
      timestamp: log.timestamp.toISOString(),
      hash: log.hash,
    }));

    const parser = new Parser({ fields: ["username", "email", "timestamp", "hash"] });
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment(`vote-logs-${electionId}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};

// 6. Get votes by election with user info
exports.getVotesByElection = async (req, res) => {
  try {
    const votes = await Vote.find({ election: req.params.electionId }).populate("user", "username email");
    res.status(200).json(votes);
  } catch (err) {
    console.error("Error fetching votes:", err);
    res.status(500).json({ message: "Error fetching votes." });
  }
};

// 7. Aggregated election results (recommended for large datasets)*
exports.getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    console.log("📥 Election ID received:", electionId);

    if (!electionId) {
      console.log("❌ No election ID provided");
      return res.status(400).json({ message: "Election ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      console.log("❌ Invalid election ID format");
      return res.status(400).json({ message: "Invalid election ID" });
    }

    const results = await Vote.aggregate([
      { $match: { election: new mongoose.Types.ObjectId(electionId) } },
      {
        $group: {
          _id: "$candidate",
          votes: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "candidates", 
          localField: "_id",
          foreignField: "_id",
          as: "candidate",
        },
      },
      { $unwind: "$candidate" },
      {
        $project: {
          _id: "$candidate._id",
          name: "$candidate.name",
          position: "$candidate.position",
          image: "$candidate.image",
          votes: 1,
        },
      },
    ]);

    console.log("✅ Results fetched:", results);
    return res.status(200).json(results);
  } catch (error) {
    console.error("🔥 Server error fetching results:", error);
    return res.status(500).json({ message: "Server error fetching results" });
  }
};
