import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import "./ManageElection.css";

const ManageElection = () => {
  const { id } = useParams(); // election ID
  const token = localStorage.getItem("token");

  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position: "",
    bio: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/candidates/election/${id}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const errorMsg = errorData?.message || `Failed to load candidates: ${res.status}`;
          console.error(errorMsg);
          setCandidates([]); // clear on failure
          return;
        }

        const data = await res.json();
        setCandidates(data);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setCandidates([]);
      }
    };
    fetchCandidates();
  }, [id]);

  const handleImageChange = (e) => {
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

  const handleChange = (e) => {
    setNewCandidate({ ...newCandidate, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", newCandidate.name);
    formData.append("position", newCandidate.position);
    formData.append("bio", newCandidate.bio);
    formData.append("election", id); // <-- REQUIRED: send election ID
    if (newCandidate.image) formData.append("image", newCandidate.image);

    const url = editing
      ? `${API_BASE_URL}/candidates/${editing}`
      : `${API_BASE_URL}/candidates`;
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      let updated;
      if (contentType && contentType.includes("application/json")) {
        updated = await res.json();
      }

      if (!res.ok) {
        alert(updated?.message || "Failed to save candidate.");
        return;
      }

      if (editing) {
        setCandidates((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c))
        );
      } else if (updated) {
        setCandidates((prev) => [...prev, updated]);
      } else {
        const refreshed = await fetch(`${API_BASE_URL}/candidates/election/${id}`).then((res) => res.json());
        setCandidates(refreshed);
      }

      setNewCandidate({ name: "", position: "", bio: "", image: null });
      setEditing(null);
      setPreview(null);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error submitting candidate.");
    }
  };

  const handleEdit = (candidate) => {
    setNewCandidate({
      name: candidate.name,
      position: candidate.position,
      bio: candidate.bio,
      image: null,
    });
    setEditing(candidate._id);
    setPreview(
      candidate.image
        ? `${API_BASE_URL}/${candidate.image.replace(/\\/g, "/")}`
        : null
    );
  };

  const handleDelete = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c._id !== candidateId));
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to delete candidate.");
      }
    } catch (err) {
      console.error("Deletion error:", err);
      alert("Error deleting candidate.");
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
        <label>Candidate Image:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && <img src={preview} alt="Preview" className="image-preview" />}
        <button type="submit">{editing ? "Update" : "Add"} Candidate</button>
      </form>

      <div className="candidate-list">
        <h3>Candidate List</h3>
        {candidates.length === 0 && <p>No candidates yet.</p>}
        {candidates.map((candidate) => (
          <div className="candidate-card" key={candidate._id}>
            <img
              src={
                candidate.image
                  ? `${API_BASE_URL}/${candidate.image.replace(/\\/g, "/")}`
                  : "/default-user.png"
              }
              alt={candidate.name}
              className="candidate-img"
            />
            <div className="candidate-info">
              <h4>{candidate.name}</h4>
              <p>
                <strong>Position:</strong> {candidate.position}
              </p>
              <p>{candidate.bio}</p>
              <div className="actions">
                <button onClick={() => handleEdit(candidate)}>Edit</button>
                <button
                  className="danger"
                  onClick={() => handleDelete(candidate._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageElection;
