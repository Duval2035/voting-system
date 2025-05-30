// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import API_BASE_URL from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setElections(data);
        } else {
          throw new Error(data.message || "Failed to fetch elections");
        }
      } catch (err) {
        console.error("Error loading elections:", err.message);
        setError(err.message);
      }
    };

    fetchElections();
  }, [token]);

  const filteredElections = elections.filter((election) =>
    filter === "all" ? true : election.status === filter
  );

  const stats = {
    total: elections.length,
    active: elections.filter((e) => e.status === "active").length,
    voters: elections.reduce((sum, e) => sum + (e.totalVoters || 0), 0),
    votes: elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0),
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <p>Manage elections and view results</p>

        {error && <div className="error-message">⚠️ {error}</div>}

        <div className="dashboard-stats">
          <div className="stat-box">Total Elections<br />{stats.total}</div>
          <div className="stat-box">Active Elections<br />{stats.active}</div>
          <div className="stat-box">Total Voters<br />{stats.voters}</div>
          <div className="stat-box">Total Votes<br />{stats.votes}</div>
          <button className="create-btn" onClick={() => navigate("/create-election")}>
            + Create New Election
          </button>
        </div>

        <div className="tabs">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Active</button>
          <button className={filter === "upcoming" ? "active" : ""} onClick={() => setFilter("upcoming")}>Upcoming</button>
        </div>

        <div className="election-list">
          {filteredElections.map((election) => (
            <div key={election._id} className="election-card">
              <div className="election-header">
                <h3>{election.title}</h3>
                <span className="status-badge">
                  {new Date(election.startDate) > new Date()
                    ? "Upcoming"
                    : new Date(election.endDate) < new Date()
                    ? "Ended"
                    : "Active"}
                </span>
              </div>
              <p className="org-name">{election.organizationName || "No organization"}</p>
              <p className="description">{election.description}</p>
              <p className="dates">📅 {election.startDate} – {election.endDate}</p>
              <div className="election-actions">
                <button onClick={() => navigate(`/results/${election._id}`)}>View Results</button>
                <button onClick={() => navigate(`/manage-election/${election._id}`)}>Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
