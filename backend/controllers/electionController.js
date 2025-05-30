// backend/controllers/electionController.js
const Election = require("../models/Election");

exports.createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const organizationName = req.user.organizationName;

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
    const elections = await Election.find({
      organizationName: req.user.organizationName,
    });

    res.status(200).json(elections);
  } catch (error) {
    console.error("Get Elections Error:", error);
    res.status(500).json({ message: "Error fetching elections" });
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
    const deleted = await Election.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Election not found" });
    res.status(200).json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error("Delete Election Error:", error);
    res.status(500).json({ message: "Failed to delete election" });
  }
};