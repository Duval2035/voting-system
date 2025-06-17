import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import "./VotePage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const VotePage = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
      
const res = await fetch(`${API_BASE_URL}/elections/${id}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,  
  },
});
console.log("token is", token);
localStorage.setItem("token", data.token);

        const electionData = await res.json();
        if (res.ok) {
          setElection(electionData);
        } else {
          setMessage("❌ Election not found or unauthorized.");
          setLoading(false);
          return;
        }

        const cRes = await fetch(`${API_BASE_URL}/candidates/by-election/${id}`);
        const cData = await cRes.json();
        if (cRes.ok) {
          setCandidates(cData);
        } else {
          setMessage("❌ Failed to load candidates.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setMessage("❌ Error fetching election data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleVote = async (candidateId) => {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      setMessage("❌ User info missing. Please log in again.");
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch {
      setMessage("❌ User info corrupted. Please log in again.");
      return;
    }

    if (!user.username || !user.email) {
      setMessage("❌ User info incomplete. Please log in again.");
      return;
    }

    if (!window.confirm("Are you sure you want to vote for this candidate?")) return;

    console.log("Submitting vote with:", {
      electionId: id,
      candidateId,
      name: user.username,
      email: user.email,
    });

    try {
      const res = await fetch(`${API_BASE_URL}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          electionId: id,
          candidateId,
          name: user.username,
          email: user.email,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Vote submitted successfully.");
      } else {
        console.error("Vote error:", result);
        setMessage(result.message || "❌ Failed to submit vote.");
      }
    } catch (err) {
      console.error("Submit vote error:", err);
      setMessage("❌ Network error during vote submission.");
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!election) return <p>{message || "❌ Could not load election."}</p>;

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
                    ? `http://localhost:5000${candidate.image}`
                    : "/default-user.png"
                }
                alt={candidate.name}
                className="candidate-img"
              />
              <div className="candidate-info">
                <h4>{candidate.name}</h4>
                <p><strong>Position:</strong> {candidate.position}</p>
                <p>{candidate.bio}</p>
                <button onClick={() => handleVote(candidate._id)}>Vote</button>
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
