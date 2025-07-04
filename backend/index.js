// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const voteRoutes = require("./routes/voteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const voterRoutes = require("./routes/voterRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/auth");
const electionRoutes = require("./routes/electionRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const auditorRoutes = require("./routes/auditorRoutes");
const voteLogRoutes = require("./routes/voteLogRoutes");
const blockchainRoutes = require("./routes/blockchainRoutes");
const blockchainResultsRoutes = require("./routes/blockchainResultsRoutes");

const { getElectionResults } = require("./controllers/voteController");
const { contract, wallet, provider } = require("./blockchain/contractService");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Define allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://voting-system-blue.vercel.app",
  "https://voting-system-duval2035s-projects.vercel.app",
  "https://voting-system-git-main-duval2035s-projects.vercel.app",
];

// ✅ Enable CORS with dynamic origin checking
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ✅ Serve candidate images statically at /uploads/candidates
app.use("/uploads/candidates", (req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  next();
}, express.static(path.join(__dirname, "uploads", "candidates")));

// ✅ Serve all other uploaded files from /uploads
app.use("/uploads/candidates", express.static(path.join(__dirname, "uploads/candidates")));
app.use("/uploads", (req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  next();
}, express.static(path.join(__dirname, "uploads")));

// ✅ Setup API routes
const setupRoutes = () => {
  app.use("/api/auth", authRoutes);
  app.use("/api/elections", electionRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/candidates", candidateRoutes); // now separate from static
  app.use("/api/votes", voteRoutes);
  app.use("/api/voters", voterRoutes);
  app.use("/api/auditor", auditorRoutes);
  app.use("/api/vote-logs", voteLogRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/blockchain", blockchainRoutes);
  app.use("/api/blockchain-results", blockchainResultsRoutes);

  // ✅ Election results endpoint
  app.get("/votes/results/:electionId", async (req, res) => {
    try {
      await getElectionResults(req, res);
    } catch (error) {
      console.error("❌ Error fetching results:", error);
      res.status(500).json({ message: "Server error fetching results." });
    }
  });
};

// ✅ Connect MongoDB
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// ✅ Start Express server
const startServer = async () => {
  await connectMongo();

  try {
    const walletAddress = wallet.address || (await wallet.getAddress());
    console.log(`🧾 Backend wallet address: ${walletAddress}`);

    const signerAddress = await wallet.getAddress();
    console.log(`🧾 Backend signer address: ${signerAddress}`);

    const network = await provider.getNetwork();
    console.log(`🔗 Connected to Ethereum network: ${network.name} (chainId: ${network.chainId})`);
  } catch (err) {
    console.error("❌ Blockchain connection error:", err.message);
    process.exit(1);
  }

  setupRoutes();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

console.log("🔥 backend/server.js is running");
startServer();
