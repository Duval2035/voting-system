const crypto = require("crypto");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const VoteLog = require("../models/VoteLog");
const { Parser } = require("json2csv");

// Submit Vote & Save VoteLog
exports.submitVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user.userId;

  if (!electionId || !candidateId) {
    return res.status(400).json({ message: "Election ID and Candidate ID are required." });
  }

  try {
    const alreadyVoted = await Vote.findOne({ election: electionId, user: userId });
    if (alreadyVoted) {
      return res.status(400).json({ message: "You already voted in this election." });
    }

    const vote = new Vote({
      election: electionId,
      candidate: candidateId,
      user: userId,
    });
    await vote.save();

    // ✅ Log the vote with Merkle hash
    const timestamp = new Date();
    const hashString = `${userId}-${electionId}-${candidateId}-${timestamp.toISOString()}`;
    const hash = crypto.createHash("sha256").update(hashString).digest("hex");

    const log = new VoteLog({
      user: userId,
      election: electionId,
      timestamp,
      hash,
    });

    await log.save();

    res.status(200).json({ message: "✅ Vote submitted and logged successfully." });
  } catch (error) {
    console.error("❌ Vote submission error:", error);
    res.status(500).json({ message: "Failed to submit vote." });
  }
};

// Get results for Election
exports.getResults = async (req, res) => {
  try {
    const electionId = req.params.id;
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

// Candidate-specific result
exports.getCandidateResults = async (req, res) => {
  const userId = req.params.id;

  try {
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

// Fetch vote logs (Auditor)
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

// ✅ Export logs as CSV
exports.exportVoteLogsCSV = async (req, res) => {
  try {
    const { electionId } = req.params;
    const logs = await VoteLog.find({ election: electionId }).populate("user", "username email");

    if (!logs.length) {
      return res.status(400).json({ message: "No vote logs to export." });
    }

    const fields = ["user.username", "user.email", "election", "timestamp", "hash"];
    const parser = new Parser({ fields });
    const csv = parser.parse(logs);

    res.header("Content-Type", "text/csv");
    res.attachment(`vote-logs-${electionId}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};
