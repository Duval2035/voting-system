import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./ExportPages.css";

const ExportVoters = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setElections(data);
      } catch (err) {
        setError("Failed to load elections.");
      }
    };
    fetchElections();
  }, [token]);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
     const response = await fetch(
  `${API_BASE_URL}/elections/${selectedElection}/export-voters`,
  {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Export failed: ${response.status} - ${text}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voters-${selectedElection}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(`Failed to export voters: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="export-container">
      <h1>📤 Export Voters</h1>
      <p>Select an election to export its voter list.</p>

      {error && <div className="export-error">{error}</div>}

      <select
        value={selectedElection}
        onChange={(e) => setSelectedElection(e.target.value)}
        className="export-select"
      >
        <option value="">-- Select Election --</option>
        {elections.map((el) => (
          <option key={el._id} value={el._id}>
            {el.title}
          </option>
        ))}
      </select>

      <button
        onClick={handleExport}
        disabled={!selectedElection || loading}
        className="export-button"
      >
        {loading ? "Exporting..." : "Export Voters"}
      </button>
    </div>
  );
};

export default ExportVoters;
