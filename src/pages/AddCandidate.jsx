import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AddCandidate.css";

const AddCandidate = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    biography: "",
    imageUrl: "", // New field for image URL
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      fullName: formData.fullName,
      position: formData.position,
      biography: formData.biography,
      imageUrl: formData.imageUrl,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/elections/${electionId}/candidates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Candidate added successfully!");
        navigate(`/admin/elections/${electionId}`);
      } else {
        alert("Failed to add candidate.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the candidate.");
    }
  };

  return (
    <div className="add-candidate-container">
      <h2>Add New Candidate</h2>
      <form onSubmit={handleSubmit} className="add-candidate-form">
        <label>
          Full Name:
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Position:
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Biography:
          <textarea
            name="biography"
            value={formData.biography}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Image URL:
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Paste image URL here (e.g. https://imgur.com/xyz.png)"
            required
          />
        </label>
        <button type="submit">Add Candidate</button>
      </form>
    </div>
  );
};

export default AddCandidate;
