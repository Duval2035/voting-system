import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState("");
  const organizationName = localStorage.getItem("organizationName");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to load elections");
        }

        const data = await res.json();
        const now = new Date();

        const visible = data.filter(
          (election) =>
            election.organizationName === organizationName &&
            new Date(election.startDate) <= now &&
            new Date(election.endDate) >= now
        );

        setElections(visible);
      } catch (err) {
        console.error("UserDashboard Error:", err);
        setError("Failed to fetch elections. Please try again.");
      }
    };

    fetchElections();
  }, [organizationName, token]);

  return (
    <>
  
      <div className="user-dashboard">
        <h2>Available Elections for {organizationName}</h2>

        {error && <p className="error-msg">⚠️ {error}</p>}

        {elections.length === 0 ? (
          <p>No elections available right now.</p>
        ) : (
          <ul className="election-list">
            {elections.map((election) => (
              <li key={election._id} className="election-card">
                <div className="card-header">
                  <h3>{election.title}</h3>
                  <p>
                    <strong>Status:</strong>{" "}
                    {new Date(election.startDate) > new Date()
                      ? "Upcoming"
                      : new Date(election.endDate) < new Date()
                      ? "Ended"
                      : "Active"}
                  </p>
                </div>
                <p>{election.description}</p>
                <p>
                  <strong>Dates:</strong>{" "}
                  {new Date(election.startDate).toLocaleString()} –{" "}
                  {new Date(election.endDate).toLocaleString()}
                </p>
                <Link to={`/vote/${election._id}`}>
                  <button className="vote-button">Vote Now</button>
                </Link>
                <Link to={`/results/${election._id}`}>
                 <button className="view-button">View Results</button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default UserDashboard;