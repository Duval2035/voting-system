// src/pages/AuditorDashboard.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";
import "./AuditorDashboard.css";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const AuditorDashboard = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch elections
 useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/elections/auditor`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setElections(data);
        } else {
          console.error('Failed to fetch elections:', data.message);
        }
      } catch (error) {
        console.error('Error fetching elections:', error);
      }
    };
    fetchElections();
  }, [token]);

  // Fetch results and logs for selected election
  useEffect(() => {
    if (!selectedElection) return;

    const fetchResults = async () => {
      const res = await fetch(`${API_BASE_URL}/votes/results/${selectedElection._id}`);
      const data = await res.json();
      if (res.ok) setResults(data);
    };

    const fetchLogs = async () => {
      const res = await fetch(`${API_BASE_URL}/vote-logs/${selectedElection._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setLogs(data);
    };

    fetchResults();
    fetchLogs();
  }, [selectedElection, token]);

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/export/${selectedElection._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vote_logs.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("❌ CSV export failed.");
      console.error("CSV export failed:", err);
    }
  };

  const chartData = {
    labels: results.map(r => r.name),
    datasets: [{
      label: "Votes",
      data: results.map(r => r.votes),
      backgroundColor: "#3b82f6",
    }]
  };

  return (
    <div className="auditor-dashboard">
      <h2>📊 Auditor Dashboard</h2>

      <section className="election-list">
        <h3>📥 Elections</h3>
        {elections.length === 0 ? (
          <p>No elections available</p>
        ) : (
          <ul>
            {elections.map((election) => (
              <li key={election._id}>
                <button onClick={() => setSelectedElection(election)}>
                  {election.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedElection && (
        <>
          <section className="chart-section">
            <h3>📈 {selectedElection.title} Results</h3>
            {results.length === 0 ? (
              <p>No results yet.</p>
            ) : (
              <Bar data={chartData} />
            )}
            <button onClick={downloadCSV} className="csv-button">📥 Export Logs to CSV</button>
          </section>

          <section className="log-section">
            <h3>📜 Vote Logs</h3>
            {logs.length === 0 ? (
              <p>No vote logs found yet.</p>
            ) : (
              <ul>
                {logs.map((log, index) => (
                  <li key={index}>
                    🗳️ {log.user?.username || "Unknown"} voted on {new Date(log.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AuditorDashboard;
