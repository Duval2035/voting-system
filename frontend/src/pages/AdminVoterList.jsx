// src/pages/AdminVoterList.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AdminVoterList.css";

const AdminVoterList = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [voters, setVoters] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
  const fetchElections = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/elections/admin/elections`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log("✅ Elections response:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to load elections");
    }

    if (!Array.isArray(data)) {
      throw new Error("Expected an array of elections, got something else");
    }

    setElections(data);
  } catch (err) {
    console.error("Failed to fetch elections:", err);
    setError("❌ Could not load elections.");
  }
};
    setLoading(false);
  fetchElections();
}, [token]);

  const handleElectionChange = async (e) => {
    const electionId = e.target.value;
    setSelectedElection(electionId);
    setVoters([]);
    setError("");

    if (!electionId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/voters/by-election/${electionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load voters.");
      setVoters(data.voters || []);
    } catch (err) {
      console.error("Failed to load voters:", err);
      setError("❌ Failed to load voters: " + err.message);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Username", "Email", "Voter ID"],
      ...voters.map((v) => [v.username, v.email, v._id]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `voters_${selectedElection}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="voter-list-container"><p>⏳ Loading...</p></div>;

  return (
    <div className="voter-list-container">
      <h2>🗳️ Voter List by Election</h2>

      {error && <p className="error-msg">{error}</p>}

      {!error && (
        <>
          <select onChange={handleElectionChange} value={selectedElection}>
            <option value="">-- Select Election --</option>
            {elections.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>

          {selectedElection && (
            <>
              <div className="voter-summary">
                <h3>Total Voters: {voters.length}</h3>
                <button onClick={exportCSV} disabled={voters.length === 0}>
                  📤 Export as CSV
                </button>
              </div>
              {voters.length === 0 ? (
                <p>😕 No voters found for this election.</p>
              ) : (
                <ul className="voter-list">
                  {voters.map((voter) => (
                    <li key={voter._id}>
                      {voter.username} – {voter.email}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminVoterList;
