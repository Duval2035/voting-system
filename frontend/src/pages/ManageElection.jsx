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
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      const res = await fetch(`${API_BASE_URL}/candidates/by-election/${id}`);
      const data = await res.json();
      if (res.ok) setCandidates(data);
    };
    fetchCandidates();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCandidate((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", newCandidate.name);
    formData.append("position", newCandidate.position);
    formData.append("bio", newCandidate.bio);
    if (newCandidate.image) formData.append("image", newCandidate.image);

    const url = editing
      ? `${API_BASE_URL}/candidates/${id}/${editing}`
      : `${API_BASE_URL}/candidates/${id}`;

    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      if (editing) {
        setCandidates((prev) =>
          prev.map((c) => (c._id === data._id ? data : c))
        );
      } else {
        setCandidates([...candidates, data]);
      }

      setNewCandidate({
        name: "",
        position: "",
        bio: "",
        image: null,
      });
      setImagePreview("");
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
      image: null,
    });
    setImagePreview(candidate.image || "");
    setEditing(candidate._id);
  };

  const handleDelete = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;

    const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

        <input
          name="name"
          placeholder="Full Name"
          value={newCandidate.name}
          onChange={handleChange}
          required
        />
        <input
          name="position"
          placeholder="Position"
          value={newCandidate.position}
          onChange={handleChange}
          required
        />
        <textarea
          name="bio"
          placeholder="Biography"
          value={newCandidate.bio}
          onChange={handleChange}
          required
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {imagePreview && (
          <div className="image-preview">
            <p>Image Preview:</p>
            <img src={imagePreview} alt="Preview" style={{ width: "120px", borderRadius: "8px" }} />
          </div>
        )}

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
