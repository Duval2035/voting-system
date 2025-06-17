// controllers/electionController.js
const Election = require("../models/Election");

const Vote = require("../models/Voter");
const User = require("../models/User");

exports.createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const { organizationName } = req.user;

    const newElection = new Election({
      title,
      description,
      startDate,
      endDate,
      organizationName,
    });

    await newElection.save();
    res.status(201).json({ message: "Election created", election: newElection });
  } catch (error) {
    console.error("Create Election Error:", error);
    res.status(500).json({ message: "Failed to create election" });
  }
};

exports.getElectionsByOrganization = async (req, res) => {
  try {
    const organizationName = req.user.organizationName;
    const elections = await Election.find({ organizationName });
    res.status(200).json(elections); 
  } catch (error) {
    console.error("Failed to get elections:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });
    res.status(200).json(election);
  } catch (error) {
    console.error("Get Election By ID Error:", error);
    res.status(500).json({ message: "Error fetching election" });
  }
};

exports.updateElectionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Election.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updated);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Failed to update election status" });
  }
};
exports.deleteElection = async (req, res) => {
  try {
    const { id } = req.params;
    await Election.findByIdAndDelete(id);
    res.status(200).json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error("Delete Election Error:", error);
    res.status(500).json({ message: "Failed to delete election" });
  }
};

// controllers/electionController.js
exports.getElectionsForAuditor = async (req, res) => {
  try {
    // Assuming you have a model Election and a way to determine auditor's organization
    const elections = await Election.find({ organization: req.user.organization });
    res.status(200).json(elections);
  } catch (error) {
    console.error('Error fetching elections for auditor:', error);
    res.status(500).json({ message: 'Failed to fetch elections' });
  }
};
exports.getVotersByElection = async (req, res) => {
  try {
    const electionId = req.params.id;
    const votes = await Vote.find({ election: electionId }).populate("user", "username email role");

    const uniqueVoters = votes
      .map(v => v.user)
      .filter((v, i, arr) => arr.findIndex(u => u._id.toString() === v._id.toString()) === i);

    res.status(200).json(uniqueVoters);
  } catch (err) {
    console.error("Error fetching voters:", err);
    res.status(500).json({ message: "Failed to load voters." });
  }
};


