// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
        setError(err.message || "Failed to fetch elections.");
      }
    };
    fetchElections();
  }, [token]);

  const now = new Date();

  const activeElections = elections.filter(
    (e) => new Date(e.startDate) <= now && new Date(e.endDate) >= now
  );
  const upcomingElections = elections.filter(
    (e) => new Date(e.startDate) > now
  );

  const filtered = elections.filter((e) => {
    if (filter === "active")
      return new Date(e.startDate) <= now && new Date(e.endDate) >= now;
    if (filter === "upcoming") return new Date(e.startDate) > now;
    return true;
  });

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>🛠️ Admin Panel</h2>
        <ul>
          <li onClick={() => navigate("/admin/dashboard")}>📊 Dashboard</li>
          <li onClick={() => navigate("/create-election")}>➕ Create Election</li>
          <li onClick={() => navigate("/admin/voters")}>👥 Voter List</li>
          <li onClick={() => navigate("/admin/messages")}>✉️ Send Messages</li>
          <li onClick={() => navigate("/admin/message-history")}>🕘 Message History</li>
          <li onClick={() => navigate("/admin/eligibility")}>✔️ Voter Eligibility</li>
          <li onClick={() => navigate("/admin/export-voters")}>📤 Export Voters</li>
          <li onClick={() => navigate("/admin/export-logs")}>📥 Export Logs</li>
        </ul>
      </aside>

      <main className="admin-main">
        <h1>Admin Dashboard</h1>
        <p>Manage and oversee elections with full control.</p>

        {error && <div className="error">{error}</div>}

        <div className="summary-cards">
          <div className="summary-card total">
            <h4>Total Elections</h4>
            <p>{elections.length}</p>
          </div>
          <div className="summary-card active">
            <h4>Active</h4>
            <p>{activeElections.length}</p>
          </div>
          <div className="summary-card upcoming">
            <h4>Upcoming</h4>
            <p>{upcomingElections.length}</p>
          </div>
        </div>

        <div className="admin-tabs">
          <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>All</button>
          <button onClick={() => setFilter("active")} className={filter === "active" ? "active" : ""}>Active</button>
          <button onClick={() => setFilter("upcoming")} className={filter === "upcoming" ? "active" : ""}>Upcoming</button>
        </div>

        <div className="admin-cards">
          {filtered.length === 0 ? (
            <p className="empty-msg">No elections available.</p>
          ) : (
            filtered.map((election) => (
              <div className="admin-card" key={election._id}>
                <h3>{election.title}</h3>
                <p><strong>Org:</strong> {election.organizationName}</p>
                <p><strong>Start:</strong> {new Date(election.startDate).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(election.endDate).toLocaleString()}</p>
                <div className="card-actions">
                  <button onClick={() => navigate(`/results/${election._id}`)}>📊 Results</button>
                  <button onClick={() => navigate(`/manage-election/${election._id}`)}>👥 Manage</button>
                  <button onClick={() => navigate(`/edit-election/${election._id}`)}>✏️ Edit</button>
                  <span className="delete">
                    <button
                      onClick={async () => {
                        if (window.confirm("Delete this election?")) {
                          await fetch(`${API_BASE_URL}/elections/${election._id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          window.location.reload();
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
