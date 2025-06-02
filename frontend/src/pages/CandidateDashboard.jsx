// src/pages/CandidateDashboard.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./CandidateDashboard.css";

const CandidateDashboard = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCandidateResult = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/votes/candidate/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setCandidate(data);
        }
      } catch (error) {
        console.error("Error loading candidate results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateResult();
    const interval = setInterval(fetchCandidateResult, 10000); // auto-refresh every 10 sec
    return () => clearInterval(interval);
  }, [user.id, token]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="candidate-dashboard">
      <h2>📈 My Vote Summary</h2>
      {candidate ? (
        <div className="candidate-card">
          <img src={`${API_BASE_URL}${candidate.image}`} alt={candidate.name} />
          <h3>{candidate.name}</h3>
          <p><strong>{candidate.position}</strong></p>
          <p>🗳️ <strong>{candidate.votes}</strong> vote(s)</p>
        </div>
      ) : (
        <p>No results yet.</p>
      )}
    </div>
  );
};

export default CandidateDashboard;
