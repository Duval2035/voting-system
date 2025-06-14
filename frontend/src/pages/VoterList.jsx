// src/pages/VoterList.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./VoterList.css";

const VoterList = () => {
  const [voters, setVoters] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/voters`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setVoters(data);
      } catch (err) {
        console.error("Error fetching voters:", err);
        setError("❌ Failed to load voter list.");
      }
    };
    fetchVoters();
  }, [token]);

  return (
    <div className="voter-list-container">
      <h2>🧑‍🤝‍🧑 Registered Voters</h2>
      {error && <p className="error-msg">{error}</p>}
      {voters.length > 0 ? (
        <table className="voter-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {voters.map((v) => (
              <tr key={v._id}>
                <td>{v.username}</td>
                <td>{v.email}</td>
                <td>{v.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>🕵️ No voters found.</p>
      )}
    </div>
  );
};

export default VoterList;
