const crypto = require("crypto");
const mongoose = require("mongoose");
const Voter = require("../models/Voter");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const VoteLog = require("../models/VoteLog");
const { Parser } = require("json2csv");


// 🗳️ 1️⃣ Submit vote and generate log
const submitVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User not found in token" });
  }

  if (!electionId || !candidateId) {
    return res.status(400).json({ message: "Election ID and Candidate ID are required." });
  }

  try {
    const alreadyVoted = await Vote.findOne({ election: electionId, user: userId });
    if (alreadyVoted) {
      return res.status(409).json({ message: "You have already voted in this election." });
    }

    const vote = new Vote({ election: electionId, candidate: candidateId, user: userId });
    await vote.save();

    const timestamp = new Date();
    const hash = crypto
      .createHash("sha256")
      .update(`${userId}-${electionId}-${candidateId}-${timestamp.toISOString()}`)
      .digest("hex");

    const log = new VoteLog({ user: userId, election: electionId, timestamp, hash });
    await log.save();

    res.status(200).json({ message: "✅ Vote submitted and logged successfully." });
  } catch (error) {
    console.error("❌ Vote submission error:", error);
    res.status(500).json({ message: "Failed to submit vote." });
  }
};

// 🧮 2️⃣ Get real-time results per election
const getResults = async (req, res) => {
  try {
    const electionId = req.params.id || req.params.electionId;
    const votes = await Vote.find({ election: electionId }).populate("candidate");

    const tally = {};
    for (const vote of votes) {
      const cid = vote.candidate?._id?.toString();
      if (!cid) continue;

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
    console.error("❌ Failed to fetch results:", err);
    res.status(500).json({ message: "Error fetching results" });
  }
};

// 📊 3️⃣ Get candidate-specific vote count
const getCandidateResults = async (req, res) => {
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
    console.error("❌ Candidate result error:", err);
    res.status(500).json({ message: "Error fetching candidate results" });
  }
};

// 🧾 4️⃣ Get vote logs by election
const getVoteLogs = async (req, res) => {
  try {
    const { electionId } = req.params;
    const logs = await VoteLog.find({ election: electionId })
      .populate("user", "username email")
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error("❌ Vote log fetch error:", error);
    res.status(500).json({ message: "Error fetching vote logs" });
  }
};

// 📤 5️⃣ Export vote logs as CSV
const exportVoteLogsCSV = async (req, res) => {
  try {
    const { electionId } = req.params;
    const logs = await VoteLog.find({ election: electionId }).populate("user", "username email");

    const fields = ["username", "email", "timestamp", "hash"];
    const parser = new Parser({ fields });

    const formatted = logs.map(log => ({
      username: log.user?.username || "N/A",
      email: log.user?.email || "N/A",
      timestamp: log.timestamp.toISOString(),
      hash: log.hash,
    }));

    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment(`vote-logs-${electionId}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("❌ CSV export error:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};

// 📋 6️⃣ Get all votes for an election
const getVotesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const votes = await Vote.find({ election: electionId }).populate("user", "username email");
    res.status(200).json(votes);
  } catch (err) {
    console.error("❌ Error fetching votes:", err);
    res.status(500).json({ message: "Error fetching votes." });
  }
};

// 📈 7️⃣ Aggregated vote result (faster)
const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!electionId || !mongoose.Types.ObjectId.isValid(electionId)) {
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

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Server error fetching results:", error);
    res.status(500).json({ message: "Server error fetching results" });
  }
};

module.exports = {
  submitVote,
  getResults,
  getCandidateResults,
  getVoteLogs,
  exportVoteLogsCSV,
  getVotesByElection,
  getElectionResults,
};


const castVote = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user._id; // from authentication middleware

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    // Check if user is eligible
    if (!election.eligibleVoters.includes(userId)) {
      return res.status(403).json({ message: "You are not eligible to vote in this election." });
    }

    // Proceed to cast vote logic here
    // ...

    res.json({ message: "Vote cast successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};