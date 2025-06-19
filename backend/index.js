const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
const messageRoutes = require("./routes/messageRoutes");


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/elections", require("./routes/electionRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/candidates", require("./routes/candidateRoutes"));
app.use("/api/votes", require("./routes/voteRoutes"));
app.use("/api/voters", require("./routes/voterRoutes"));
app.use("/api/auditor", require("./routes/auditorRoutes"));
app.use("/api/vote-logs", require("./routes/voteLogRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/messages", messageRoutes);


// Route to get election results
app.get("/votes/results/:electionId", async (req, res) => {
  const { electionId } = req.params;

  try {
    const results = await getVotesByElectionId(electionId);

    if (!results || results.length === 0) {
      // No results: send 204 No Content
      return res.status(204).send();
    }

    // Results found: send JSON
    return res.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return res.status(500).json({ message: "Server error fetching results." });
  }
});
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
