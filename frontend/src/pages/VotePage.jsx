// src/pages/VotePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import "./VotePage.css";

const VotePage = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const electionData = await res.json();
        if (res.ok) {
          setElection(electionData);
        } else {
          setMessage("Election not found or unauthorized.");
        }

        const cRes = await fetch(`${API_BASE_URL}/candidates/by-election/${id}`);
        const cData = await cRes.json();
        if (cRes.ok) {
          setCandidates(cData);
        }
      } catch (err) {
        setMessage("An error occurred while loading data.");
      }
    };

    fetchData();
  }, [id, token]);

  const handleVote = async () => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start || now > end) {
      setMessage("Voting is not open at this time.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          electionId: id,
          candidateId: selectedCandidate
        })
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Vote submitted successfully.");
      } else {
        setMessage(result.message || "❌ Failed to submit vote.");
      }
    } catch (err) {
      setMessage("Error submitting vote.");
    }
  };

  if (!election) return <p>{message || "Loading..."}</p>;

  return (
    <div className="vote-page">
      <h2>{election.title}</h2>
      <p>{election.description}</p>
      <h3>Select a candidate:</h3>
      <div className="candidate-list">
        {candidates.map((candidate) => (
          <label key={candidate._id} className="candidate-option">
            <input
              type="radio"
              name="candidate"
              value={candidate._id}
              onChange={() => setSelectedCandidate(candidate._id)}
            />
            <span>{candidate.name} – {candidate.position}</span>
          </label>
        ))}
      </div>
      <button disabled={!selectedCandidate} onClick={handleVote}>
        Submit Vote
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default VotePage;
