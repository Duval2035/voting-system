import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";
import "./AuditorDashboard.css";

const AuditorDashboard = () => {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/elections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch elections");
        }

        const data = await res.json();
        setElections(data);
      } catch (err) {
        console.error("Failed to fetch elections:", err);
        setError(err.message);
      }
    };

    fetchElections();
  }, []);

  return (
    <div className="auditor-dashboard">
      <h2>🧾 Elections Overview</h2>

      {error && <div className="error-message">{error}</div>}

      {elections.length === 0 ? (
        <p>No elections available</p>
      ) : (
        <div className="election-list">
          {elections.map((election) => (
            <div key={election._id} className="election-card">
              <h3>{election.title}</h3>
              <p><strong>Organization:</strong> {election.organizationName}</p>
              <p><strong>Start:</strong> {new Date(election.startDate).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(election.endDate).toLocaleString()}</p>
              <Link
                to={`/auditor/results/${election._id}`}
                className="view-results-btn"
              >
                View Results
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditorDashboard;
