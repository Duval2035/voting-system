// src/pages/CreateElection.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./CreateElection.css";

const CreateElection = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const organizationName = JSON.parse(localStorage.getItem("user"))?.organizationName || "";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE_URL}/elections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...formData, organizationName }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Election created successfully");
      navigate("/admin/dashboard");
    } else {
      alert(`Failed to create election: ${data.message || "Unknown error"}`);
    }
  };

  return (
    <div className="create-election-container">
      <h2>Create Election</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Election Title" value={formData.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required />
        <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required />
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateElection;
