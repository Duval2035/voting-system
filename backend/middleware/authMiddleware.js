const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect normal users (authenticated)
const protectUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    // You can add role check here if needed (e.g., allow any role)
    // For now, just allow any authenticated user

    req.user = {
      _id: user._id,
      role: user.role,
      email: user.email,
      username: user.username,
      organizationName: user.organizationName,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Existing protectAdmin middleware
const protectAdmin = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    req.user = {
      _id: user._id,
      role: user.role,
      email: user.email,
      username: user.username,
      organizationName: user.organizationName,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { protectAdmin, protectUser };
