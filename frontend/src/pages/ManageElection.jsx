// frontend/src/pages/ManageElection.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import "./ManageElection.css";

const ManageElection = () => {
  const { id } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position: "",
    bio: "",
    image: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_BASE_URL}/candidates/by-election/${id}`)
      .then(res => res.json())
      .then(data => setCandidates(data));
  }, [id]);

  const handleChange = (e) => {
    setNewCandidate({ ...newCandidate, [e.target.name]: e.target.value });
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newCandidate)
    });

    if (res.ok) {
      const data = await res.json();
      setCandidates([...candidates, data]);
      setNewCandidate({ name: "", position: "", bio: "", image: "" });
    } else {
      alert("Failed to add candidate");
    }
  };

  const handleDelete = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    const res = await fetch(`${API_BASE_URL}/candidates/delete/${candidateId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setCandidates(candidates.filter(c => c._id !== candidateId));
    } else {
      alert("Failed to delete candidate");
    }
  };

  return (
    <div className="manage-election-container">
      <h2>Manage Election Candidates</h2>
      <form className="candidate-form" onSubmit={handleAddCandidate}>
        <input name="name" placeholder="Name" value={newCandidate.name} onChange={handleChange} required />
        <input name="position" placeholder="Position" value={newCandidate.position} onChange={handleChange} required />
        <textarea name="bio" placeholder="Biography" value={newCandidate.bio} onChange={handleChange} required />
        <input name="image" placeholder="Image URL" value={newCandidate.image} onChange={handleChange} />
        <button type="submit">Add Candidate</button>
      </form>

      <div className="candidate-list">
        <h3>Candidate List</h3>
        {candidates.map(candidate => (
          <div className="candidate-card" key={candidate._id}>
            <img src={candidate.image} alt={candidate.name} />
            <div>
              <h4>{candidate.name}</h4>
              <p><strong>Position:</strong> {candidate.position}</p>
              <p>{candidate.bio}</p>
              <button onClick={() => handleDelete(candidate._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageElection;
