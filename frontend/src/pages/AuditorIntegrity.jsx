// src/pages/AuditorIntegrity.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AuditorIntegrity.css";

const AuditorIntegrity = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [integrityData, setIntegrityData] = useState(null);
  const token = localStorage.getItem("token");

  // 🟦 Fetch Elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auditor/elections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setElections(data);
        else console.error("Failed to fetch elections:", data.message);
      } catch (err) {
        console.error("Fetch elections error:", err);
      }
    };

    fetchElections();
  }, []);

  // 🟦 Fetch Integrity Result
  const verifyIntegrity = async (electionId) => {
    setSelectedElection(electionId);
    try {
      const res = await fetch(`${API_BASE_URL}/auditor/integrity/${electionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setIntegrityData(data);
      } else {
        console.error("Integrity check failed:", data.message);
        setIntegrityData(null);
      }
    } catch (err) {
      console.error("Integrity request failed:", err);
      setIntegrityData(null);
    }
  };

  return (
    <div className="integrity-dashboard">
      <h2>🔐 Election Integrity Check</h2>

      <div className="integrity-section">
        <h3>📋 Select an Election</h3>
        {elections.length === 0 ? (
          <p>❌ No elections available</p>
        ) : (
          <ul className="election-list">
            {elections.map((e) => (
              <li key={e._id}>
                <button onClick={() => verifyIntegrity(e._id)}>
                  {e.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {integrityData && (
        <div className="result-section">
          <h3>📊 Integrity Result</h3>
          <p>
            Status:{" "}
            <strong className={integrityData.isValid ? "valid" : "tampered"}>
              {integrityData.isValid ? "Valid ✅" : "Tampered ❌"}
            </strong>
          </p>

          <p><strong>Merkle Root (simulated):</strong> <code>{integrityData.rootHash}</code></p>

          <h4>🔍 Preview Vote Hashes</h4>
          <ul>
            {integrityData.hashes.slice(0, 5).map((hash, index) => (
              <li key={index}><code>{hash}</code></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AuditorIntegrity;
