import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE_URL = "https://voting-system-gs6m.onrender.com/api";

const VotePage = () => {
  const { id: electionId } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/elections/${electionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch election data");

        const data = await response.json();
        setElection(data.election || data);
        setCandidates(data.candidates || []);
      } catch (error) {
        setMessage("Failed to load election or candidates. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [electionId, token]);

  const handleVote = async (candidateId) => {
    if (!user || !user._id) {
      alert("Please log in to vote.");
      return;
    }

    if (!window.confirm("Are you sure you want to vote for this candidate?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ electionId, candidateId }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Vote failed");

      setMessage("✅ Your vote has been successfully recorded!");
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center"><h4>⏳ Loading election details...</h4></div>;
  }

  return (
    <div className="vote-page">
      <Navbar />
      <div className="container mt-5">
        <h1 className="text-center">{election?.name}</h1>
        <p className="text-center text-muted">{election?.description}</p>

        {message && <div className="alert alert-info text-center mt-4" role="alert">{message}</div>}

        <div className="row mt-4">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
  src={
    candidate.image
      ? `${API_BASE_URL}/api/candidates/${candidate.image}`.replace(/\\/g, "/")
      : "/default-user.png"
  }
  alt={candidate.name}
  className="candidate-img"
/>

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{candidate.name}</h5>
                  <p className="card-text text-muted">{candidate.position}</p>
                  <p className="card-text">{candidate.bio}</p>
                  <button className="btn btn-primary mt-auto" onClick={() => handleVote(candidate._id)}>
                    Vote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VotePage;