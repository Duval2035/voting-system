// src/pages/ManageElection.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import "./ManageElection.css";

const ManageElection = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position: "",
    bio: "",
    image: "" // will hold base64 or URL preview
  });

  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(null);

  // Load candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      const res = await fetch(`${API_BASE_URL}/candidates/by-election/${id}`);
      const data = await res.json();
      if (res.ok) setCandidates(data);
    };
    fetchCandidates();
  }, [id]);

  const handleChange = (e) => {
    setNewCandidate({ ...newCandidate, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      setFile(imageFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCandidate({ ...newCandidate, image: reader.result }); // base64 preview
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editing
      ? `${API_BASE_URL}/candidates/${id}/${editing}`
      : `${API_BASE_URL}/candidates/${id}`;
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newCandidate)
    });

    if (res.ok) {
      const updated = await res.json();
      if (editing) {
        setCandidates((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c))
        );
      } else {
        setCandidates([...candidates, updated]);
      }

      setNewCandidate({ name: "", position: "", bio: "", image: "" });
      setFile(null);
      setEditing(null);
    } else {
      alert("Failed to save candidate.");
    }
  };

  const handleEdit = (candidate) => {
    setNewCandidate({
      name: candidate.name,
      position: candidate.position,
      bio: candidate.bio,
      image: candidate.image
    });
    setEditing(candidate._id);
  };

  const handleDelete = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;

    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setCandidates(candidates.filter((c) => c._id !== candidateId));
    } else {
      alert("Failed to delete candidate.");
    }
  };

  return (
    <div className="manage-election-container">
      <h2>Manage Election Candidates</h2>

      <form className="candidate-form" onSubmit={handleSubmit}>
        <h3>{editing ? "Edit Candidate" : "Add New Candidate"}</h3>
        <input name="name" placeholder="Full Name" value={newCandidate.name} onChange={handleChange} required />
        <input name="position" placeholder="Position" value={newCandidate.position} onChange={handleChange} required />
        <textarea name="bio" placeholder="Biography" value={newCandidate.bio} onChange={handleChange} required />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {newCandidate.image && <img src={newCandidate.image} alt="Preview" style={{ width: "80px", marginTop: "10px" }} />}
        <button type="submit">{editing ? "Update" : "Add"} Candidate</button>
      </form>

      <div className="candidate-list">
        <h3>Candidate List</h3>
        {candidates.map((candidate) => (
          <div className="candidate-card" key={candidate._id}>
            <img src={candidate.image} alt={candidate.name} />
            <div>
              <h4>{candidate.name}</h4>
              <p><strong>Position:</strong> {candidate.position}</p>
              <p>{candidate.bio}</p>
              <div className="actions">
                <button onClick={() => handleEdit(candidate)}>Edit</button>
                <button className="danger" onClick={() => handleDelete(candidate._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageElection;
