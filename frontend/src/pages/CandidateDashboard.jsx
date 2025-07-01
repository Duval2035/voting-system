import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./CandidateDashboard.css";

const CandidateDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCandidateElections = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/candidate/elections`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Failed to parse JSON response:", text);
      setError("Invalid server response when fetching elections.");
      return;
    }

    if (!res.ok) {
      setError(data.message || "Failed to fetch candidate elections.");
      return;
    }

    setElections(data);
    setError(null);
  } catch (err) {
    console.error("Error fetching candidate elections:", err);
    setError("Failed to fetch candidate elections.");
  }
};

    fetchCandidateElections();

    const interval = setInterval(fetchCandidateElections, 10000); // auto-refresh
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>⚠️ {error}</p>;

  return (
    <div className="candidate-dashboard">
      <h2>📈 My Elections</h2>
      {elections.length === 0 ? (
        <p>You are not part of any elections.</p>
      ) : (
        elections.map((election) => (
          <div key={election._id} className="candidate-card">
            <h3>{election.title}</h3>
            <p><strong>{election.position}</strong></p>
            <p>🗳️ <strong>{election.votes}</strong> vote(s)</p>
            {election.image && (
              <img src={`${API_BASE_URL}${election.image}`} alt={election.title} />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CandidateDashboard;
