// src/pages/AdminVoterList.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AdminVoterList.css";

const AdminVoterList = () => {
  const token = localStorage.getItem("token");

  const [elections, setElections] = useState([]);
  const [voters, setVoters] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setElections(data);
        else throw new Error(data.message);
      } catch (err) {
        setError("❌ Failed to load elections.");
      }
    };

    fetchElections();
  }, [token]);

  useEffect(() => {
    if (!selectedElectionId) return;

    const fetchVoters = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/votes/${selectedElectionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setVoters(data);
        else throw new Error(data.message);
      } catch (err) {
        setError("❌ Failed to load voter data.");
        setVoters([]);
      }
    };

    fetchVoters();
  }, [selectedElectionId, token]);

  return (
    <div className="admin-voterlist">
      <h2>👥 Voter List by Election</h2>

      <label>Select Election</label>
      <select
        value={selectedElectionId}
        onChange={(e) => setSelectedElectionId(e.target.value)}
      >
        <option value="">-- Select --</option>
        {elections.map((e) => (
          <option key={e._id} value={e._id}>
            {e.title}
          </option>
        ))}
      </select>

      {selectedElectionId && (
        <div className="voter-stats">
          <h4>Total Votes Cast: {voters.length}</h4>
          <ul>
            {voters.map((v) => (
              <li key={v._id}>
                {v.user?.username} — {new Date(v.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
};

export default AdminVoterList;
