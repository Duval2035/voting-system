// src/pages/AuditorIntegrity.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AuditorIntegrity.css";

const AuditorIntegrity = () => {
  const token = localStorage.getItem("token");
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [integrityData, setIntegrityData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setElections(data);
        } else {
          console.error("Failed to fetch elections:", data.message);
        }
      } catch (err) {
        console.error("Election fetch error:", err);
      }
    };

    fetchElections();
  }, [token]);

  const fetchIntegrity = async () => {
    if (!selectedElection) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auditor/integrity/${selectedElection}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setIntegrityData(data);
      } else {
        console.error("Integrity fetch failed:", data.message);
        setIntegrityData(null);
      }
    } catch (err) {
      console.error("Fetch integrity error:", err);
      setIntegrityData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auditor-integrity">
      <h2>Election Integrity Checker</h2>
      <p>Check if votes have been tampered with.</p>

      <div className="integrity-form">
        <label>Select Election:</label>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
        >
          <option value="">-- Select an Election --</option>
          {elections.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
        <button onClick={fetchIntegrity} disabled={!selectedElection || loading}>
          {loading ? "Checking..." : "Verify Integrity"}
        </button>
      </div>

      {integrityData && (
        <div className="integrity-result">
          <h3>🔒 Integrity Status</h3>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                integrityData.isValid ? "valid" : "tampered"
              }
            >
              {integrityData.isValid ? "Valid ✅" : "Tampered ❌"}
            </span>
          </p>
          <h4>🧾 First 10 Vote Hashes:</h4>
          <ul>
            {integrityData.sampleHashes?.slice(0, 10).map((hash, index) => (
              <li key={index}>{hash}</li>
            ))}
          </ul>
          <p><strong>Merkle Root:</strong> {integrityData.merkleRoot}</p>
        </div>
      )}
    </div>
  );
};

export default AuditorIntegrity;
