// src/pages/VoterEligibility.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./VoterEligibility.css";

const VoterEligibility = () => {
  const [users, setUsers] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [selectedVoters, setSelectedVoters] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, electionRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/elections`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const usersData = await userRes.json();
        const electionsData = await electionRes.json();

        setUsers(usersData.users || []);
        setElections(electionsData);
      } catch (error) {
        console.error("Error fetching data", error);
        setMessage("Failed to load data");
      }
    };

    fetchData();
  }, [token]);

  const toggleSelect = (userId) => {
    setSelectedVoters((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const assignVoters = async () => {
    if (!selectedElection || selectedVoters.length === 0) {
      setMessage("Please select an election and at least one voter.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/elections/${selectedElection}/assign-voters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voterIds: selectedVoters }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("✅ Voters assigned successfully.");
    } catch (err) {
      console.error("Error assigning voters:", err);
      setMessage("❌ Failed to assign voters.");
    }
  };

  return (
    <div className="eligibility-container">
      <h2>✔️ Assign Voter Eligibility</h2>

      {message && <p className="message">{message}</p>}

      <label>Choose Election:</label>
      <select value={selectedElection} onChange={(e) => setSelectedElection(e.target.value)}>
        <option value="">-- Select Election --</option>
        {elections.map((el) => (
          <option key={el._id} value={el._id}>
            {el.title} ({new Date(el.startDate).toLocaleDateString()} - {new Date(el.endDate).toLocaleDateString()})
          </option>
        ))}
      </select>

      <h3>Select Voters:</h3>
      <ul className="voter-list">
        {users.map((user) => (
          <li key={user._id}>
            <label>
              <input
                type="checkbox"
                checked={selectedVoters.includes(user._id)}
                onChange={() => toggleSelect(user._id)}
              />
              {user.username} ({user.email})
            </label>
          </li>
        ))}
      </ul>

      <button onClick={assignVoters}>✅ Assign Selected Voters</button>
      <button onClick={() => navigate("/admin/dashboard")}>⬅️ Back to Dashboard</button>
    </div>
  );
};

export default VoterEligibility;
