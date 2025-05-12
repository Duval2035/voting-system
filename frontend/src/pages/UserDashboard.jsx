import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [userPolls, setUserPolls] = useState([]);
  const [userStatus, setUserStatus] = useState({});

  useEffect(() => {
    setUserPolls([
      { id: 1, title: "Election for City Mayor", status: "active" },
      { id: 2, title: "Presidential Election", status: "upcoming" },
    ]);
    setUserStatus({
      votedPolls: [1],
    });
  }, []);

  const handleVote = (pollId) => {
    if (userStatus.votedPolls.includes(pollId)) {
      alert("You have already voted in this election.");
    } else {
      alert("Vote submitted!");
      setUserStatus((prevState) => ({
        ...prevState,
        votedPolls: [...prevState.votedPolls, pollId],
      }));
    }
  };

  return (
    <div>
      <div className="dashboard-container">
        <h2>Welcome, User!</h2>
        <div className="polls-list">
          <h3>Active Polls</h3>
          {userPolls.filter((poll) => poll.status === "active").map((poll) => (
            <div className="poll" key={poll.id}>
              <h4>{poll.title}</h4>
              <button onClick={() => handleVote(poll.id)}>Vote</button>
            </div>
          ))}
        </div>
        <div className="polls-list">
          <h3>Upcoming Polls</h3>
          {userPolls.filter((poll) => poll.status === "upcoming").map((poll) => (
            <div className="poll" key={poll.id}>
              <h4>{poll.title}</h4>
              <button disabled>Voting not yet available</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
