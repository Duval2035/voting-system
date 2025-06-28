import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import "./VotePage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const VotePage = () => {
  const { id } = useParams(); // election ID
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch election
        const res = await fetch(`${API_BASE_URL}/elections/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const electionData = await res.json();
        if (!res.ok) throw new Error(electionData.message || "Failed to load election");
        setElection(electionData);

        // Fetch candidates
        const cRes = await fetch(`${API_BASE_URL}/candidates/by-election/${id}`);
        const cData = await cRes.json();
        if (!cRes.ok) throw new Error(cData.message || "Failed to load candidates");
        setCandidates(cData);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleVote = async (candidateId) => {
    if (!user || !user.email) {
      alert("❌ User info missing. Please log in again.");
      return;
    }

    if (!window.confirm("Are you sure you want to vote for this candidate?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          electionId: id,
          candidateId, // ⬅️ blockchainId, not Mongo _id
          email: user.email,
        }),
      });

      const result = await res.json();

      if (res.status === 409) {
        alert("⚠️ You have already voted in this election.");
      } else if (res.ok) {
        alert("✅ Vote cast successfully and stored on blockchain");
      } else {
        alert("❌ Vote failed: " + (result.message || "Unexpected error"));
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("❌ Network error: " + err.message);
    }
  };

  if (loading) return <p>Loading election...</p>;
  if (!election) return <p>{message || "❌ Election not found."}</p>;

  return (
    <>
      <Navbar />
      <div className="vote-page">
        <h2>{election.title}</h2>
        <p>{election.description}</p>
        <h3>Choose your candidate:</h3>

        <div className="candidate-list">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="candidate-card">
                 <img
  src={
    candidate.image
      ? `http://localhost:5000/${candidate.image.replace(/\\/g, "/")}`
      : "/default-user.png"
  }
  alt={candidate.name}
  className="candidate-img"
/>


              <div className="candidate-info">
                <h4>{candidate.name}</h4>
                <p><strong>Position:</strong> {candidate.position}</p>
                <p>{candidate.bio}</p>
                
                <button onClick={() => handleVote(candidate.blockchainId)}>Vote</button>
              </div>
            </div>
          ))}
        </div>

        {message && <p className="message">{message}</p>}
      </div>
      <Footer />
    </>
  );
};

export default VotePage;
