import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewPolls.css";

const ViewPolls = () => {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call – Replace with real API later
    const samplePolls = [
      { id: 1, question: "Who should be the next student president?", options: ["Alice", "Bob", "Charlie"], status: "open" },
      { id: 2, question: "Should we allow cellphones in class?", options: ["Yes", "No"], status: "open" },
    ];
    setPolls(samplePolls);
  }, []);

  const handleVote = (pollId) => {
    // Navigate to vote page
    navigate(`/vote/${pollId}`);
  };

  return (
    <div className="viewpolls-container">
      <h2>Available Polls</h2>
      <div className="poll-list">
        {polls.length === 0 ? (
          <p>No polls available right now.</p>
        ) : (
          polls.map((poll) => (
            <div className="poll-card" key={poll.id}>
              <h3>{poll.question}</h3>
              <p>Options: {poll.options.length}</p>
              <p>Status: <span className={poll.status}>{poll.status}</span></p>
              <button onClick={() => handleVote(poll.id)}>Vote Now</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewPolls;
