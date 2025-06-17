// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const electionRoutes = require("./routes/electionRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voterRoutes = require("./routes/voterRoutes");
const voteLogRoutes = require("./routes/voteLogRoutes");
const auditorRoutes = require("./routes/auditorRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const voteRoutes = require("./routes/voteRoutes");
const protectedRoutes = require("./routes/protected");


// DB connection
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // adjust for your frontend
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/otp-login", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected");
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT || 5000}`)
  );
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/vote-logs", voteLogRoutes);
app.use("/api/auditor", auditorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/protected", protectedRoutes);

// ✅ Fallback 404
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
