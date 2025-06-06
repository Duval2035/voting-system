// src/pages/AuditorDashboard.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AuditorDashboard.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const AuditorDashboard = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [voteLogs, setVoteLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Fetch Elections
  const fetchElections = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auditor/elections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setElections(data);
      } else {
        console.error("Failed to fetch elections:", data.message);
      }
    } catch (err) {
      console.error("Fetch elections error:", err);
    }
  };

  // ✅ Fetch Results
  const fetchResults = async (electionId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/votes/results/${electionId}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        console.error("Result fetch failed:", data.message);
      }
    } catch (err) {
      console.error("Error loading results:", err);
    }
    setLoading(false);
  };

  // ✅ Fetch Vote Logs
  const fetchLogs = async (electionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/${electionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setVoteLogs(data);
      } else {
        console.error("Vote log error:", data.message);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    }
  };

  // ✅ CSV Export
  const downloadCSV = async () => {
    if (!selectedElection) return alert("Select an election first.");
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/export/${selectedElection}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to export CSV");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vote_logs.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("❌ CSV export failed.");
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleSelectElection = (electionId) => {
    setSelectedElection(electionId);
    fetchResults(electionId);
    fetchLogs(electionId);
  };

  const chartData = {
    labels: results.map((c) => c.name),
    datasets: [
      {
        label: "Votes",
        data: results.map((c) => c.votes),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="auditor-dashboard">
      <h2>📊 Auditor Dashboard</h2>

      <section>
        <h3>📥 Elections</h3>
        {elections.length === 0 ? (
          <p>No elections available</p>
        ) : (
          <ul className="election-list">
            {elections.map((e) => (
              <li key={e._id}>
                <button onClick={() => handleSelectElection(e._id)}>
                  {e.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>📈 Real-Time Vote Tally</h3>
        {loading ? (
          <p>Loading chart...</p>
        ) : results.length === 0 ? (
          <p>No results yet.</p>
        ) : (
          <Bar data={chartData} />
        )}
      </section>

      <section>
        <h3>📜 Vote Logs</h3>
        <button onClick={downloadCSV} className="csv-button">⬇ Export CSV</button>
        {voteLogs.length === 0 ? (
          <p>🧾 No vote logs found yet.</p>
        ) : (
          <ul className="log-list">
            {voteLogs.map((log) => (
              <li key={log._id}>
                🧾 {log.user?.email || "Unknown"} — {new Date(log.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AuditorDashboard;
