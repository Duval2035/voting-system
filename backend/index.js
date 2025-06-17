const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const electionRoutes = require("./routes/electionRoutes");

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:5173", // Vite frontend
  credentials: true,
}));
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/elections", electionRoutes);
app.use("/api/auth", require("./routes/auth")); 
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/adminRoutes")); 
app.use("/api/elections", require("./routes/electionRoutes")); 
app.use("/api/candidates", require("./routes/candidateRoutes"));
app.use("/api/votes", require("./routes/voteRoutes"));
app.use("/api/voters", require("./routes/voterRoutes"));
app.use("/api/auditor", require("./routes/auditorRoutes"));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
