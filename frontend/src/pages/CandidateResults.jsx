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

        const text = await res.text();

        try {
          const data = JSON.parse(text);
          if (!res.ok) {
            throw new Error(data.message || "Failed to fetch results");
          }
          setResults(data);
          setError("");
        } catch (jsonErr) {
          console.error("JSON parse error:", jsonErr, "\nRaw response:", text);
          setResults(null);
          setError("Invalid server response.");
        }
      } catch (err) {
        console.error("Candidate Results Error:", err);
        setResults(null);
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
