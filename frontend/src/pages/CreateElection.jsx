import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./CreateElection.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ✅ Safely retrieve user
let organizationName = "";
try {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  organizationName = user?.organizationName || "";
} catch (e) {
  console.warn("User not found in localStorage");
}

const CreateElection = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    organizationName, // Send to backend
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/elections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const text = await res.text();

      try {
        const data = JSON.parse(text);

        if (res.ok) {
          alert("✅ Election created successfully");
          navigate("/admin/dashboard");
        } else {
          alert(`❌ Failed to create election: ${data.message || "Unknown error"}`);
        }
      } catch {
        alert("❌ Failed to create election: Invalid server response.");
      }
    } catch (err) {
      console.error("❌ Election Creation Error:", err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <>
      <div className="create-election-container">
        <h2>Create Election</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Election Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
          <button type="submit">Create</button>
        </form>
      </div>
    </>
  );
};

export default CreateElection;
