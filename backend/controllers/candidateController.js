// backend/controllers/candidateController.js

const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

exports.addCandidate = async (req, res) => {
  try {
    const { id: electionId } = req.params;
    const { name, position, bio, image } = req.body;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidate = new Candidate({
      name,
      position,
      bio,
      image,
      election: electionId
    });

    const saved = await candidate.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Add Candidate Error:', error);
    res.status(500).json({ message: 'Failed to add candidate' });
  }
};

exports.getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const candidates = await Candidate.find({ election: electionId });
    res.json(candidates);
  } catch (error) {
    console.error('Get Candidates Error:', error);
    res.status(500).json({ message: 'Failed to load candidates' });
  }
};
exports.deleteCandidate = async (req, res) => {
  try {
    const { id: candidateId } = req.params;
    const candidate = await Candidate.findByIdAndDelete(candidateId);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete Candidate Error:', error);
    res.status(500).json({ message: 'Failed to delete candidate' });
  }
};