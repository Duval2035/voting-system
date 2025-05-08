import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./UserVoting.css";

const UserVoting = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voting, setVoting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/elections/user-active-upcoming`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch elections");
        return res.json();
      })
      .then((data) => {
        setElections(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error loading elections");
        setLoading(false);
      });
  }, [user, token]);

  const handleVote = async (electionId, candidateId) => {
    if (voting) return; // prevent double voting
    setVoting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ electionId, candidateId, userId: user._id }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Voting failed");
      }

      alert("Vote recorded successfully!");
      // Optionally refetch elections or update UI to mark voted elections
      const updatedElections = elections.map((el) => {
        if (el._id === electionId) {
          return { ...el, userHasVoted: true };
        }
        return el;
      });
      setElections(updatedElections);
    } catch (err) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <p>Loading elections...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <Navbar />
      <div className="user-voting-container" style={{ padding: "20px" }}>
        <h2>Welcome, {user?.username || "User"}</h2>

        {elections.length === 0 ? (
          <p>No active or upcoming elections found.</p>
        ) : (
          elections.map((election) => (
            <div key={election._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px", borderRadius: "8px" }}>
              <h3>{election.title}</h3>
              <p>{election.description}</p>
              <p>
                📅 {election.startDate} - {election.endDate}
              </p>

              {election.userHasVoted ? (
                <p style={{ color: "green", fontWeight: "bold" }}>You have already voted in this election.</p>
              ) : (
                <>
                  <h4>Candidates:</h4>
                  {election.candidates && election.candidates.length > 0 ? (
                    election.candidates.map((candidate) => (
                      <div key={candidate._id} style={{ marginBottom: "8px" }}>
                        <strong>{candidate.fullName}</strong> - {candidate.position}
                        <button
                          style={{ marginLeft: "15px" }}
                          disabled={voting}
                          onClick={() => handleVote(election._id, candidate._id)}
                        >
                          Vote
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No candidates available.</p>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
      <Footer />
    </>
  );
};

export default UserVoting;
