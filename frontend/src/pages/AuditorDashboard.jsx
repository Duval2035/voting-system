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

  const fetchElections = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auditor/elections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setElections(data);
      else console.error("Failed to fetch elections:", data.message);
    } catch (err) {
      console.error("Fetch elections error:", err);
    }
  };

  const fetchResults = async (electionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/votes/results/${electionId}`);
      const data = await res.json();
      if (res.ok) setResults(data);
      else setResults([]);
    } catch (err) {
      console.error("Fetch results error:", err);
    }
  };

  const fetchLogs = async (electionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/${electionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setLogs(data);
      else setLogs([]);
    } catch (err) {
      console.error("Fetch logs error:", err);
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vote-logs.csv";
      a.click();
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("❌ CSV export failed.");
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchResults(selectedElection);
      fetchLogs(selectedElection);
    }
  }, [selectedElection]);

  const chartData = {
    labels: results.map((r) => r.name),
    datasets: [
      {
        label: "Votes",
        data: results.map((r) => r.votes),
        backgroundColor: "#36A2EB",
      },
    ],
  };

  return (
    <div className="auditor-dashboard">
      <h2>📊 Auditor Dashboard</h2>

      <section>
        <h3>📥 Elections</h3>
        {elections.length === 0 ? (
          <p>🧾 No elections available</p>
        ) : (
          <ul className="election-list">
            {elections.map((e) => (
              <li
                key={e._id}
                onClick={() => setSelectedElection(e._id)}
                className={selectedElection === e._id ? "active" : ""}
              >
                🗳 {e.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>📈 Real-Time Vote Tally</h3>
        {results.length === 0 ? (
          <p>No results yet.</p>
        ) : (
          <Bar data={chartData} />
        )}
      </section>

      <section>
        <h3>📜 Vote Logs</h3>
        <button onClick={fetchLogs}>🔄 Refresh Logs</button>
        <button onClick={downloadCSV}>📥 Export CSV</button>

        {logs.length === 0 ? (
          <p>🧾 No vote logs found yet.</p>
        ) : (
          <ul className="logs">
            {logs.map((log) => (
              <li key={log._id}>
                🧾 {log.user?.username} voted at{" "}
                {new Date(log.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AuditorDashboard;
