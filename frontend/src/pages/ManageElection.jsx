import React, { useState } from 'react';
import './ManageElection.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ManageElection = () => {
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      position: 'President',
      bio: 'Experienced leader with a passion for community growth.',
      image: 'https://via.placeholder.com/100',
      votes: 123
    },
    {
      id: 2,
      name: 'Bob Smith',
      position: 'Vice President',
      bio: 'Dedicated to representing every member fairly.',
      image: 'https://via.placeholder.com/100',
      votes: 89
    }
  ]);

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    position: '',
    bio: '',
    image: ''
  });

  const handleChange = (e) => {
    setNewCandidate({ ...newCandidate, [e.target.name]: e.target.value });
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    const newEntry = {
      ...newCandidate,
      id: Date.now(),
      votes: 0
    };
    setCandidates([...candidates, newEntry]);
    setNewCandidate({ name: '', position: '', bio: '', image: '' });
  };

  const handleDeleteCandidate = (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      setCandidates(candidates.filter((c) => c.id !== id));
    }
  };

  return (
    <>
      <Navbar />
      <div className="manage-election-container">
        <h2>Manage Election Candidates</h2>

        <form className="candidate-form" onSubmit={handleAddCandidate}>
          <h3>Add New Candidate</h3>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={newCandidate.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={newCandidate.position}
            onChange={handleChange}
            required
          />
          <textarea
            name="bio"
            placeholder="Candidate Biography"
            value={newCandidate.bio}
            onChange={handleChange}
            required
          ></textarea>
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={newCandidate.image}
            onChange={handleChange}
          />
          <button type="submit">Add Candidate</button>
        </form>

        <div className="candidate-list">
          <h3>Candidate List</h3>
          {candidates.length === 0 ? (
            <p>No candidates added yet.</p>
          ) : (
            candidates.map((candidate) => (
              <div className="candidate-card" key={candidate.id}>
                <img src={candidate.image} alt={candidate.name} />
                <div>
                  <h4>{candidate.name}</h4>
                  <p><strong>Position:</strong> {candidate.position}</p>
                  <p>{candidate.bio}</p>
                  <p><strong>Votes:</strong> {candidate.votes}</p>
                  <button onClick={() => handleDeleteCandidate(candidate.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ManageElection;
