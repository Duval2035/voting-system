const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // Fetch full user

    if (!user) return res.status(401).json({ message: "User not found" });

    // Attach full user data including organizationName
    req.user = {
      _id: user._id,
      role: user.role,
      email: user.email,
      username: user.username,
      organizationName: user.organizationName, // ✅ This is critical
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
