// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setElections(data);
      } catch (err) {
        setError(err.message || "Failed to load elections.");
      }
    };
    fetchElections();
  }, [token, refresh]);

  const now = new Date();
  const filteredElections = elections.filter((e) => {
    if (filter === "active") {
      return new Date(e.startDate) <= now && new Date(e.endDate) >= now;
    }
    if (filter === "upcoming") {
      return new Date(e.startDate) > now;
    }
    return true;
  });

  const stats = {
    total: elections.length,
    active: elections.filter((e) => new Date(e.startDate) <= now && new Date(e.endDate) >= now).length,
    voters: elections.reduce((sum, e) => sum + (e.totalVoters || 0), 0),
    votes: elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0),
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/elections/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete election");
      setRefresh((prev) => !prev); // Re-fetch elections
    } catch (err) {
      alert(err.message || "Could not delete election.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-election/${id}`);
  };

  return (
    <div className="admin-dashboard">
      <h1>🛠️ Admin Dashboard</h1>
      <p>Monitor, manage, and maintain voting integrity.</p>

      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="dashboard-stats">
        <div className="stat-box">🗳️ Total Elections<br /><strong>{stats.total}</strong></div>
        <div className="stat-box">✅ Active<br /><strong>{stats.active}</strong></div>
        <div className="stat-box">👥 Total Voters<br /><strong>{stats.voters}</strong></div>
        <div className="stat-box">📨 Total Votes<br /><strong>{stats.votes}</strong></div>
        <button className="create-btn" onClick={() => navigate("/create-election")}>
          ➕ Create Election
        </button>
      </div>

      <div className="tabs">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Active</button>
        <button className={filter === "upcoming" ? "active" : ""} onClick={() => setFilter("upcoming")}>Upcoming</button>
      </div>

      <div className="election-list">
        {filteredElections.length === 0 ? (
          <p className="empty-msg">No elections match this filter.</p>
        ) : (
          filteredElections.map((e) => (
            <div className="election-card" key={e._id}>
              <div className="card-header">
                <h3>{e.title}</h3>
                <span className="badge">
                  {new Date(e.startDate) > now
                    ? "Upcoming"
                    : new Date(e.endDate) < now
                    ? "Ended"
                    : "Active"}
                </span>
              </div>
              <p className="org-name">{e.organizationName || "No organization"}</p>
              <p className="description">{e.description}</p>
              <p className="dates">🗓️ {new Date(e.startDate).toLocaleString()} → {new Date(e.endDate).toLocaleString()}</p>
              <div className="election-actions">
                <button onClick={() => navigate(`/results/${e._id}`)}>📊 View Results</button>
                <button onClick={() => navigate(`/manage-election/${e._id}`)}>👤 Manage</button>
                <button className="edit-btn" onClick={() => handleEdit(e._id)}>✏️ Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(e._id)}>🗑️ Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
