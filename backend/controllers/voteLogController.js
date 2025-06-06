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
exports.exportLogsToCSV = async (req, res) => {
  const electionId = req.params.electionId;

  try {
    const logs = await VoteLog.find({ election: electionId })
      .populate("user", "username email")
      .sort({ timestamp: -1 });

    if (!logs.length) {
      return res.status(404).json({ message: "No logs to export" });
    }

    const fields = ["user.username", "user.email", "timestamp", "hash"];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(logs);

    res.header("Content-Type", "text/csv");
    res.attachment("vote_logs.csv");
    return res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};