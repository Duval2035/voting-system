// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [elections, setElections] = useState([]);
  const organizationName = localStorage.getItem("organizationName");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/elections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          const now = new Date();
          const visible = data.filter(
            (election) =>
              election.organizationName === organizationName &&
              new Date(election.startDate) <= now &&
              new Date(election.endDate) >= now
          );
          setElections(visible);
        }
      } catch (error) {
        console.error("Failed to fetch elections", error);
      }
    };

    fetchElections();
  }, [organizationName]);

  return (
    <div className="user-dashboard">
      <h2>Available Elections for {organizationName}</h2>
      {elections.length === 0 ? (
        <p>No elections available right now.</p>
      ) : (
        <ul>
          {elections.map((election) => (
            <li key={election._id}>
              <Link to={`/vote/${election._id}`}>{election.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserDashboard;
