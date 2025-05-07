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
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("position", formData.position);
    data.append("biography", formData.biography);
    data.append("image", formData.image);

    try {
      const response = await fetch(
        `http://localhost:5000/api/elections/${electionId}/candidates`,
        {
          method: "POST",
          body: data,
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
          Image:
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Add Candidate</button>
      </form>
    </div>
  );
};

export default AddCandidate;
