
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageElection.css";
const API_BASE_URL = "https://voting-system-gs6m.onrender.com/api";
const IMAGE_BASE_URL = "https://voting-system-gs6m.onrender.com/uploads/candidates";

const ManageElection = ({ electionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position: "",
    bio: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/candidates/election/${electionId}`);
      setCandidates(res.data);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (electionId) {
      fetchCandidates();
    }
  }, [electionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewCandidate((prev) => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidate.name) {
      alert("Candidate name is required.");
      return;
    }
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", newCandidate.name);
    formData.append("position", newCandidate.position);
    formData.append("bio", newCandidate.bio);
    formData.append("electionId", electionId);
    if (newCandidate.image) {
      formData.append("image", newCandidate.image);
    }

    try {
      await axios.post(`${API_BASE_URL}/candidates`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setNewCandidate({ name: "", position: "", bio: "", image: null });
      setPreview(null);
      fetchCandidates();
    } catch (err) {
      console.error("Failed to add candidate:", err);
      alert("Failed to add candidate.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/candidates/${id}`);
      fetchCandidates();
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      alert("Failed to delete candidate.");
    }
  };

  return (
    <div className="manage-container">
      <h2>Manage Candidates</h2>

      <form className="candidate-form" onSubmit={handleAddCandidate}>
        <input
          type="text"
          name="name"
          placeholder="Candidate Name"
          value={newCandidate.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="position"
          placeholder="Position"
          value={newCandidate.position}
          onChange={handleInputChange}
        />
        <textarea
          name="bio"
          placeholder="Candidate Bio"
          value={newCandidate.bio}
          onChange={handleInputChange}
          rows={4}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Preview" className="preview-image" />}
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Add Candidate"}
        </button>
      </form>

      {loading ? (
        <p>Loading candidates...</p>
      ) : candidates.length === 0 ? (
        <p>No candidates added yet.</p>
      ) : (
        <div className="candidate-list">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="candidate-card">
              <img src={`https://voting-system-gs6m.onrender.com/uploads/candidates/${candidate.image}`} />

              <h3>{candidate.name}</h3>
              <p className="position">{candidate.position}</p>
              <p className="bio">{candidate.bio}</p>
              <button onClick={() => handleDelete(candidate._id)} className="delete-btn">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageElection;

