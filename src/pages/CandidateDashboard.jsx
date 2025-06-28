import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./CandidateDashboard.css";

const CandidateDashboard = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCandidateResult = async () => {
      if (!user?.electionId) {
        console.warn("⚠️ Missing electionId in user data");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/candidate/results/${user.electionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const text = await res.text();

        try {
          const data = JSON.parse(text); // ✅ parse only if valid JSON
          setCandidate(data);
        } catch (err) {
          console.error("❌ Failed to parse JSON:", err, "\nRaw response:", text);
          setError("Invalid server response.");
        }
      } catch (err) {
        console.error("❌ Error fetching candidate results:", err);
        setError("Failed to fetch results.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateResult();
    const interval = setInterval(fetchCandidateResult, 10000); // Auto-refresh every 10 sec
    return () => clearInterval(interval);
  }, [user?.electionId, token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>⚠️ {error}</p>;

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
