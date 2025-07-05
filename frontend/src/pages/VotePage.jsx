import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/VotePage.css";
import { FaStar, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const API_BASE_URL = "https://voting-system-gs6m.onrender.com/api";

const VotePage = () => {
  const { id: electionId } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/elections/${electionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch election data");

        const data = await response.json();
        setElection(data.election || data);
        setCandidates(data.candidates || []);
      } catch (error) {
        setMessage("❌ Failed to load election or candidates.");
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [electionId, token]);

  const confirmVote = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const handleVote = async () => {
    if (!user || !user._id) {
      alert("Please log in to vote.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          electionId,
          candidateId: selectedCandidate._id,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.success === false) {
  throw new Error(result.message || "Your vote could not be submitted.");
}

setMessage(result.message || "✅ Your vote has been recorded successfully.");

    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setShowModal(false);
      setSelectedCandidate(null);
    }
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <h4>⏳ Loading election details...</h4>
      </div>
    );
  }

  return (
    <div className="vote-page">
      <Navbar />

      <div className="container">
        <h2 className="election-title">{election?.name}</h2>
        <p className="election-description">{election?.description}</p>

        {message && <div className="message-box">{message}</div>}

        <div className="candidate-grid">
          {candidates.map((candidate) => {
            const imageUrl = candidate.image
              ? `https://voting-system-gs6m.onrender.com/uploads/${candidate.image}`
              : "https://via.placeholder.com/300x200?text=No+Image";

            return (
              <div className="candidate-card fade-in" key={candidate._id}>
                <img
                  src={imageUrl}
                  alt={candidate.name}
                  className="candidate-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x200?text=Image+Error";
                  }}
                />
                <div className="candidate-info">
                  <h4>{candidate.name}</h4>
                  <p className="position">{candidate.position}</p>
                  <p className="experience">
                    <FaStar className="star-icon" /> {candidate.experience || "0"} years
                  </p>
                  <p className="bio">{candidate.bio || "No bio available."}</p>
                  <button onClick={() => confirmVote(candidate)}>Vote</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Your Vote</h3>
            <p>
              Are you sure you want to vote for <strong>{selectedCandidate.name}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="confirm" onClick={handleVote}>
                <FaCheckCircle /> Yes, Vote
              </button>
              <button className="cancel" onClick={() => setShowModal(false)}>
                <FaTimesCircle /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VotePage;
