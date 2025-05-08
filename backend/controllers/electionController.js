// backend/controllers/electionController.js

const Election = require('../models/Election');
const User = require('../models/User');

// Create Election
exports.createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const newElection = new Election({
      title,
      description,
      startDate,
      endDate,
      organizationName: user.organizationName,
    });

    await newElection.save();
    res.status(201).json({ message: 'Election created successfully', election: newElection });
  } catch (err) {
    console.error('Election Creation Error:', err);
    res.status(500).json({ message: 'Failed to create election' });
  }
};

// Get All Elections (Admin)
exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.status(200).json(elections);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve elections' });
  }
};

// Get Elections By Organization (User)
exports.getElectionsByOrg = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(403).json({ message: 'Unauthorized' });

    const elections = await Election.find({
      organizationName: user.organizationName,
    }).sort({ createdAt: -1 });

    res.status(200).json(elections);
  } catch (err) {
    console.error('Org Elections Error:', err);
    res.status(500).json({ message: 'Failed to fetch organization elections' });
  }
};

// Get Single Election by ID
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    res.status(200).json(election);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch election' });
  }
};
