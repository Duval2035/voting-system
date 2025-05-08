import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import "./VotePage.css";

const VotePage = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setElection(data);
        } else {
          setMessage("Election not found.");
        }

        const cRes = await fetch(`${API_BASE_URL}/candidates/by-election/${id}`);
        const cData = await cRes.json();
        if (cRes.ok) {
          setCandidates(cData);
        }
      } catch (err) {
        setMessage("Error fetching data.");
      }
    };
    fetchData();
  }, [id, token]);

  const handleVote = async () => {
    if (!selected) return;

    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start || now > end) {
      return setMessage("Voting is not allowed at this time.");
    }

    const res = await fetch(`${API_BASE_URL}/votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ electionId: id, candidateId: selected }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Your vote has been submitted!");
    } else {
      setMessage(data.error || "⚠️ Failed to submit vote.");
    }
  };

  if (!election) return <p>{message || "Loading..."}</p>;

  return (
    <div className="vote-page">
      <h2>{election.title}</h2>
      <p>{election.description}</p>
      <h3>Select your candidate:</h3>

      {candidates.map((candidate) => (
        <div key={candidate._id} className="candidate-option">
          <label>
            <input
              type="radio"
              name="candidate"
              value={candidate._id}
              checked={selected === candidate._id}
              onChange={() => setSelected(candidate._id)}
            />
            {candidate.name} - {candidate.position}
          </label>
        </div>
      ))}

      <button onClick={handleVote} disabled={!selected}>
        Submit Vote
      </button>

      {message && <p className="vote-message">{message}</p>}
    </div>
  );
};

export default VotePage;
