import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections`, {
          method: "GET",
          credentials: "include", // ✅ Required for cross-origin cookies
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Include JWT token if protected
          },
        });

        // Check for fetch/network issues
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch elections");
        }

        const data = await res.json();
        setElections(data);
      } catch (err) {
        console.error("❌ Error fetching elections:", err);
        setError("❌ Could not load elections.");
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

      {/* All Elections */}
      <div className="section">
        <h3>🟢 All Elections</h3>
        {elections.length === 0 ? (
          <p>No elections available for voting now.</p>
        ) : (
          <div className="election-grid">
            {elections.map((e) => (
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
        )}
      </div>

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
