// src/pages/AuditorIntegrity.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AuditorIntegrity.css";

const AuditorIntegrity = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [integrityData, setIntegrityData] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auditor/elections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setElections(data);
      } catch (err) {
        console.error("Failed to fetch elections:", err);
        setError("Failed to fetch elections");
      }
    };

    fetchElections();
  }, [token]);

  const handleSelect = async (e) => {
    const electionId = e.target.value;
    setSelectedElection(electionId);
    if (!electionId) {
      setIntegrityData(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auditor/integrity/${electionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setIntegrityData(data);
    } catch (err) {
      console.error("Failed to fetch integrity data:", err);
      setIntegrityData(null);
      setError("Failed to fetch integrity data");
    }
  };

  return (
    <div className="integrity-dashboard">
      <h2>🔐 Election Integrity Check</h2>

      <div className="card">
        <h3>📋 Select an Election</h3>
        {elections.length > 0 ? (
          <select onChange={handleSelect} value={selectedElection}>
            <option value="">-- Choose an Election --</option>
            {elections.map((e) => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        ) : (
          <p className="no-elections">❌ No elections available</p>
        )}
      </div>

      {integrityData && (
        <div className="card integrity-report">
          <h3>🧾 Integrity Report</h3>
          <p><strong>Status:</strong> {integrityData.isValid ? "✅ Valid (No tampering)" : "❌ Tampered (Log mismatch)"}</p>
          <p><strong>Total Logs:</strong> {integrityData.totalLogs}</p>
          <p><strong>Merkle Root:</strong> <code>{integrityData.merkleRoot}</code></p>

          {integrityData.previewHashes && (
            <div>
              <h4>🔍 Preview of First 5 Vote Hashes</h4>
              <ul className="hash-list">
                {integrityData.previewHashes.map((hash, index) => (
                  <li key={index}><code>{hash}</code></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
};

export default AuditorIntegrity;
