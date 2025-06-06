// src/pages/AuditorDashboard.jsx
import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AuditorDashboard.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AuditorDashboard = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [chartData, setChartData] = useState(null);
  const [voteLogs, setVoteLogs] = useState([]);
  const [error, setError] = useState("");
  const [csvError, setCsvError] = useState("");

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
        console.error("Error fetching elections:", err);
        setError("❌ Failed to fetch elections.");
      }
    };

    fetchElections();
  }, [token]);

  const fetchResultsAndLogs = async (electionId) => {
    setError("");
    setCsvError("");
    try {
      const [resultsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/votes/results/${electionId}`),
        fetch(`${API_BASE_URL}/vote-logs/${electionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const results = await resultsRes.json();
      const logs = await logsRes.json();

      if (resultsRes.ok) {
        setChartData({
          labels: results.map((c) => c.name),
          datasets: [
            {
              label: "Votes",
              data: results.map((c) => c.votes),
              backgroundColor: "#1e90ff",
            },
          ],
        });
      } else {
        setChartData(null);
      }

      if (logsRes.ok) {
        setVoteLogs(logs);
      } else {
        setVoteLogs([]);
      }
    } catch (err) {
      console.error("Error fetching results/logs:", err);
      setError("❌ Failed to load results or logs.");
    }
  };

  const handleElectionSelect = (e) => {
    const id = e.target.value;
    setSelectedElection(id);
    if (id) fetchResultsAndLogs(id);
  };

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/export/${selectedElection}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to export");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vote_logs_${selectedElection}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert("✅ CSV exported successfully!");
    } catch (err) {
      console.error("CSV export failed:", err);
      setCsvError("❌ CSV export failed.");
    }
  };

  return (
    <div className="auditor-dashboard">
      <h2>📊 Auditor Dashboard</h2>

      <div className="dashboard-section">
        <label>Select an Election</label>
        {elections.length > 0 ? (
          <select onChange={handleElectionSelect} value={selectedElection}>
            <option value="">-- Choose an Election --</option>
            {elections.map((e) => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        ) : (
          <p>🧾 No elections available</p>
        )}
      </div>

      <div className="dashboard-section">
        <h3>📈 Results</h3>
        {chartData ? (
          <Bar data={chartData} />
        ) : (
          <p>No results to display.</p>
        )}
      </div>

      <div className="dashboard-section">
        <h3>📜 Vote Logs</h3>
        <button onClick={downloadCSV} disabled={!selectedElection}>
          📥 Export Logs as CSV
        </button>
        {csvError && <p className="error-message">{csvError}</p>}
        {voteLogs.length > 0 ? (
          <ul className="logs-list">
            {voteLogs.map((log) => (
              <li key={log._id}>
                🧾 {log.user?.email} — {new Date(log.timestamp).toLocaleString()} — <code>{log.hash}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p>🧾 No vote logs found yet.</p>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AuditorDashboard;
