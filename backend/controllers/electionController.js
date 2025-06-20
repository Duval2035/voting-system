const Election = require("../models/Election");
const Vote = require("../models/Voter");
const User = require("../models/User");

// Create Election
exports.createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const { organizationName, _id: userId } = req.user;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newElection = new Election({
      title,
      description,
      startDate,
      endDate,
      organizationName,
      createdBy: userId,
    });

    await newElection.save();

    res.status(201).json({ message: "Election created", election: newElection });
  } catch (error) {
    console.error("❌ Create Election Error:", error);
    res.status(500).json({ message: "Failed to create election" });
  }
};

// Get Elections by Organization
exports.getElectionsByOrganization = async (req, res) => {
  try {
    const { organizationName } = req.user;
    const elections = await Election.find({ organizationName });
    res.status(200).json(elections);
  } catch (error) {
    console.error("❌ Fetch Elections Error:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};

// Get Election by ID
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.status(200).json(election);
  } catch (error) {
    console.error("❌ Get Election By ID Error:", error);
    res.status(500).json({ message: "Error fetching election" });
  }
};

// Update Election (full patch/update)
exports.updateElection = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedElection = await Election.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedElection) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.status(200).json(updatedElection);
  } catch (error) {
    console.error("❌ Update Election Error:", error);
    res.status(500).json({ message: "Failed to update election" });
  }
};

// Update Election Status (if you want partial update just for status)
exports.updateElectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedElection = await Election.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedElection) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.status(200).json(updatedElection);
  } catch (error) {
    console.error("❌ Update Election Status Error:", error);
    res.status(500).json({ message: "Failed to update election status" });
  }
};

// Delete Election
exports.deleteElection = async (req, res) => {
  try {
    const deleted = await Election.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.status(200).json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Election Error:", error);
    res.status(500).json({ message: "Failed to delete election" });
  }
};

// Get Elections for Auditor
exports.getElectionsForAuditor = async (req, res) => {
  try {
    const { organizationName } = req.user;
    const elections = await Election.find({ organizationName });
    res.status(200).json(elections);
  } catch (error) {
    console.error("❌ Get Elections for Auditor Error:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};

// Get Voters by Election ID
exports.getVotersByElection = async (req, res) => {
  try {
    const electionId = req.params.id;

    const votes = await Vote.find({ election: electionId }).populate("user", "username email role");

    const uniqueVoters = votes
      .map(v => v.user)
      .filter((v, i, arr) => arr.findIndex(u => u._id.toString() === v._id.toString()) === i);

    res.status(200).json(uniqueVoters);
  } catch (error) {
    console.error("❌ Get Voters Error:", error);
    res.status(500).json({ message: "Failed to load voters" });
  }
};

// Admin Only: Get All Elections
exports.getAllElectionsAdmin = async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: -1 });
    res.status(200).json(elections);
  } catch (error) {
    console.error("❌ Admin Fetch Elections Error:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};
