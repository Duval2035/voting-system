require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const electionRoutes = require("./routes/electionRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voterRoutes");
const voteLogRoutes = require("./routes/voteLogRoutes");
const auditorRoutes = require("./routes/auditorRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
// other routes...

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});

app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log all API requests
app.use("/api", (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/vote-logs", voteLogRoutes);
app.use("/api/auditor", auditorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);


// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});


