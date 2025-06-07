// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/elections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch elections");

        setElections(data);
      } catch (err) {
        console.error("❌ Error fetching elections:", err);
        setError("❌ Could not load elections.");
      }
    };

    fetchElections();
  }, [token]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleViewResults = (id) => {
    navigate(`/results/${id}`);
  };

  const handleVote = (id) => {
    navigate(`/vote/${id}`);
  };

  return (
    <div className={`user-dashboard ${darkMode ? "dark" : ""}`}>
      <div className="header">
        <h2>🗳️ My Elections</h2>
        <button onClick={toggleDarkMode} className="mode-toggle">
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {elections.length === 0 ? (
        <p>No elections available right now.</p>
      ) : (
        <div className="elections-grid">
          {elections.map((election) => (
            <div key={election._id} className="election-card">
              <h3>{election.title}</h3>
              <p><strong>Start:</strong> {new Date(election.startDate).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(election.endDate).toLocaleString()}</p>
              <div className="actions">
                <button onClick={() => handleVote(election._id)}>🗳️ Vote Now</button>
                <button onClick={() => handleViewResults(election._id)}>📊 View Results</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
