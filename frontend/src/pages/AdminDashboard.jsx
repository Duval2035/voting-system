import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [electionTitle, setElectionTitle] = useState("");
  const [electionDate, setElectionDate] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateElectionId, setCandidateElectionId] = useState("");
  const [elections, setElections] = useState([
    { id: "1", title: "2025 Presidential Election" },
    { id: "2", title: "Student Council Election" },
  ]);

  const handleCreateElection = (e) => {
    e.preventDefault();
    alert(`Election "${electionTitle}" created for ${electionDate}`);
    setElectionTitle("");
    setElectionDate("");
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    alert(`Candidate "${candidateName}" added to election ID: ${candidateElectionId}`);
    setCandidateName("");
    setCandidateElectionId("");
  };

  const handleViewTally = (electionId) => {
    alert(`Viewing tally for election ID: ${electionId}`);
  };

  return (
    <div>
      <Navbar />
      <div className="admin-dashboard">
        <h2>Admin Dashboard</h2>
        <div className="admin-grid">
          <div className="admin-section">
            <h3>Create New Election</h3>
            <form onSubmit={handleCreateElection}>
              <input
                type="text"
                placeholder="Election Title"
                value={electionTitle}
                onChange={(e) => setElectionTitle(e.target.value)}
                required
              />
              <input
                type="date"
                value={electionDate}
                onChange={(e) => setElectionDate(e.target.value)}
                required
              />
              <button type="submit">Create Election</button>
            </form>
          </div>

          <div className="admin-section">
            <h3>Add Candidate</h3>
            <form onSubmit={handleAddCandidate}>
              <input
                type="text"
                placeholder="Candidate Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                required
              />
              <select
                value={candidateElectionId}
                onChange={(e) => setCandidateElectionId(e.target.value)}
                required
              >
                <option value="">Select Election</option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title}
                  </option>
                ))}
              </select>
              <button type="submit">Add Candidate</button>
            </form>
          </div>

          <div className="admin-section full-width">
            <h3>Real-time Tally</h3>
            {elections.map((election) => (
              <div key={election.id} className="tally-row">
                <span>{election.title}</span>
                <button onClick={() => handleViewTally(election.id)}>View Tally</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
