
exports.getUsers = (req, res) => {
  res.status(200).json({
    message: "User list fetched successfully",
    users: [], // replace with actual logic if needed
  });
};

// Example: Get a specific user by ID
exports.getUserById = (req, res) => {
  const userId = req.params.id;
  res.status(200).json({ message: `Fetched user with ID: ${userId}` });
};
