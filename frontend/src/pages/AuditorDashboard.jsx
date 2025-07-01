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
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/auditor/elections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch elections.");
        setElections(data);
      } catch (err) {
        console.error("Error fetching elections:", err);
        setError("❌ Failed to fetch elections.");
        setElections([]);
      }
    };

    if (token) fetchElections();
    else setError("❌ Authentication token missing.");
  }, [token]);

  const safeJsonParse = async (response) => {
    if (response.status === 204) return null; // No Content
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response from server.");
    }
  };

  const fetchResultsAndLogs = async (electionId) => {
    setError("");
    setCsvError("");
    try {
      const [resultsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/votes/results/${electionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/vote-logs/${electionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const results = await safeJsonParse(resultsRes);
      const logs = await safeJsonParse(logsRes);

      if (resultsRes.ok && results) {
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

      if (logsRes.ok && logs) {
        setVoteLogs(logs);
      } else {
        setVoteLogs([]);
      }
    } catch (err) {
      console.error("Error fetching results/logs:", err);
      setError("❌ Failed to load results or logs.");
      setChartData(null);
      setVoteLogs([]);
    }
  };

  const handleElectionSelect = (e) => {
    const id = e.target.value;
    setSelectedElection(id);
    if (id) {
      fetchResultsAndLogs(id);
    } else {
      setChartData(null);
      setVoteLogs([]);
      setError("");
      setCsvError("");
    }
  };

  const downloadCSV = async () => {
    if (!selectedElection) {
      setCsvError("❌ Please select an election first.");
      return;
    }
    setCsvError("");
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/export/${selectedElection}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let errMsg = "Failed to export";
        try {
          const errData = await safeJsonParse(res);
          errMsg = errData?.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vote_logs_${selectedElection}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
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
        <label htmlFor="electionSelect">Select an Election</label>
        {elections.length > 0 ? (
          <select id="electionSelect" onChange={handleElectionSelect} value={selectedElection}>
            <option value="">-- Choose an Election --</option>
            {elections.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>
        ) : (
          <p>🧾 No elections available</p>
        )}
      </div>

      <div className="dashboard-section">
        <h3>📈 Results</h3>
        {chartData ? <Bar data={chartData} /> : <p>No results to display.</p>}
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
                🧾 {log.user?.email || "Unknown User"} — {new Date(log.timestamp).toLocaleString()} —{" "}
                <code>{log.hash}</code>
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
