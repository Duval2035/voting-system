import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("⚠️ You must be logged in to view elections.");
      return;
    }

    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections/public/available`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // Attempt to parse error message from JSON body
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch elections");
        }

        const data = await res.json();
        console.log("📥 Fetched elections:", data);
        setElections(data);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching elections:", err);
        setError(`❌ Could not load elections. ${err.message}`);
      }
    };

    fetchElections();
  }, [token]);

  return (
    <div className="user-dashboard">
      <h2>👤 User Dashboard</h2>

      {/* Voting Guide */}
      <div className="guide-box">
        <h3 onClick={() => setShowHelp(!showHelp)} className="guide-toggle">
          ❓ How to Vote {showHelp ? "▲" : "▼"}
        </h3>
        {showHelp && (
          <div className="guide-content">
            <ul>
              <li>🔍 Review available elections below.</li>
              <li>🗳️ Click the vote button to participate.</li>
              <li>🔐 Your vote is securely hashed and logged.</li>
              <li>📊 View results once voting ends.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Elections Displayed by Status */}
      {["live", "upcoming", "ended"].map((statusLabel) => {
        const filtered = elections.filter((e) => e.status === statusLabel);
        if (filtered.length === 0) return null;

        const titleMap = {
          live: "🟢 Live Elections",
          upcoming: "🕒 Upcoming Elections",
          ended: "⏹️ Ended Elections",
        };

        return (
          <div className="section" key={statusLabel}>
            <h3>{titleMap[statusLabel]}</h3>
            <div className="election-grid">
              {filtered.map((e) => (
                <div className="election-card" key={e._id}>
                  <h4>{e.title}</h4>
                  <p>
                    🕓 {new Date(e.startDate).toLocaleString()} –{" "}
                    {new Date(e.endDate).toLocaleString()}
                  </p>
                  <div className="btn-row">
                    <button onClick={() => navigate(`/vote/${e._id}`)}>🗳️ Vote</button>
                    <button onClick={() => navigate(`/results/${e._id}`)}>📊 View Results</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Security Note */}
      <div className="security-box">
        <h4>🔒 Security Assurance</h4>
        <p>
          Your vote is hashed and stored with integrity. Results are transparent and auditable.
        </p>
      </div>

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
};

export default UserDashboard;
