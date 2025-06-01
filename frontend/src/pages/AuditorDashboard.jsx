// src/pages/AuditorDashboard.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AuditorDashboard.css";

const AuditorDashboard = () => {
  const [audits, setAudits] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/votes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setAudits(data);
        } else {
          console.error("Failed to fetch votes");
        }
      } catch (err) {
        console.error("Auditor fetch error:", err);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="auditor-dashboard">
      <h2>Auditor Dashboard</h2>
      <p>Review all votes cast in the system</p>

      {audits.length === 0 ? (
        <p>No votes found.</p>
      ) : (
        <table className="audit-table">
          <thead>
            <tr>
              <th>Voter</th>
              <th>Candidate</th>
              <th>Election</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((vote) => (
              <tr key={vote._id}>
                <td>{vote.user?.username || "Unknown"}</td>
                <td>{vote.candidate?.name}</td>
                <td>{vote.election?.title || "N/A"}</td>
                <td>{new Date(vote.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AuditorDashboard;
