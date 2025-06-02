// src/pages/CandidateResults.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./CandidateResults.css";

const CandidateResults = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/votes/candidate/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch results");
        }

        setResults(data);
      } catch (err) {
        console.error("Candidate Results Error:", err);
        setError(err.message);
      }
    };

    if (user?.id) {
      fetchResults();
    }
  }, [user?.id]);

  return (
    <div className="candidate-results">
      <h2>📈 My Vote Summary</h2>
      {error && <p className="error-message">{error}</p>}
      {results ? (
        <div className="result-card">
          <p><strong>Name:</strong> {results.name}</p>
          <p><strong>Position:</strong> {results.position}</p>
          <p><strong>Total Votes:</strong> {results.votes}</p>
        </div>
      ) : (
        <p>No results yet.</p>
      )}
    </div>
  );
};

export default CandidateResults;
