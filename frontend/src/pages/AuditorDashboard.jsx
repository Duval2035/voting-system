import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AuditorDashboard.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AuditorDashboard = () => {
  const token = localStorage.getItem("token");
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);

  // Load elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auditor/elections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setElections(data);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        console.error("Fetch elections error:", err.message);
        alert("⚠️ Failed to fetch elections.");
      }
    };

    fetchElections();
  }, [token]);

  // Fetch results when election is selected
  useEffect(() => {
    if (!selectedElection) return;

    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/votes/results/${selectedElection._id}`);
        const data = await res.json();
        if (res.ok) {
          setResults(data);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        console.error("Failed to load results", err);
      }
    };

    fetchResults();
  }, [selectedElection]);

  // Fetch logs
  const fetchLogs = async () => {
    if (!selectedElection) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/${selectedElection._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(Array.isArray(data) ? data : []);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
      alert("⚠️ Failed to load logs.");
    }
  };

  // Export CSV
  const downloadCSV = async () => {
    if (!selectedElection) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/export/${selectedElection._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to export CSV");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vote_logs_${selectedElection._id}.csv`;
      link.click();
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("❌ CSV export failed.");
    }
  };

  return (
    <div className="auditor-dashboard">
      <h2>📊 Auditor Dashboard</h2>
      <p>Overview of all voting activities</p>

      <div className="section">
        <h3>📥 Elections List</h3>
        {elections.length === 0 ? (
          <p>🧾 No elections available</p>
        ) : (
          <ul className="election-list">
            {elections.map((election) => (
              <li
                key={election._id}
                onClick={() => setSelectedElection(election)}
                className={
                  selectedElection && selectedElection._id === election._id
                    ? "selected"
                    : ""
                }
              >
                {election.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedElection && (
        <>
          <div className="section">
            <h3>📈 Real-Time Vote Tally</h3>
            {results.length === 0 ? (
              <p>No results yet.</p>
            ) : (
              <Bar
                data={{
                  labels: results.map((r) => r.name),
                  datasets: [
                    {
                      label: "Votes",
                      data: results.map((r) => r.votes),
                      backgroundColor: "rgba(53, 162, 235, 0.6)",
                    },
                  ],
                }}
              />
            )}
          </div>

          <div className="section">
            <h3>📜 Vote Logs</h3>
            <button onClick={fetchLogs}>🔄 Refresh Logs</button>
            <button onClick={downloadCSV}>📥 Export CSV</button>

            {logs.length === 0 ? (
              <p>🧾 No vote logs found yet.</p>
            ) : (
              <ul className="log-list">
                {logs.map((log) => (
                  <li key={log._id}>
                    {new Date(log.timestamp).toLocaleString()} —{" "}
                    {log.user?.username || "Unknown"} —{" "}
                    {log.hash.slice(0, 12)}...
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AuditorDashboard;
