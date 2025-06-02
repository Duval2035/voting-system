import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./AuditorDashboard.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const token = localStorage.getItem("token");

const res = await fetch(`${API_BASE_URL}/auditor/elections`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const AuditorDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [elections, setElections] = useState([]);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs`)     
      const data = await res.json();
      if (res.ok) {
        setLogs(data);
      } else {
        setError("Failed to fetch vote logs");
      }
    } catch (err) {
      console.error("Error loading vote logs:", err);
      setError("Failed to fetch vote logs");
    }
  };

  const fetchElections = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auditor/elections`)
      const data = await res.json();
      if (res.ok) {
        setElections(data);
      } else {
        setError("Failed to fetch elections");
      }
    } catch (err) {
      console.error("Error fetching elections:", err);
      setError("Failed to fetch elections");
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchElections();
  }, []);

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vote-logs/export`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "vote_logs.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("❌ Failed to export CSV");
    }
  };

  // 🔢 Group logs per election
  const grouped = {};
  logs.forEach((log) => {
    const title = log.election?.title || "Unknown Election";
    const candidate = log.candidate?.name || "Unknown Candidate";

    if (!grouped[title]) grouped[title] = {};
    if (!grouped[title][candidate]) grouped[title][candidate] = 0;

    grouped[title][candidate]++;
  });

  return (
    <div className="auditor-dashboard">
      <h2>📊 Auditor Dashboard</h2>
      <p>Overview of all voting activities</p>

      {error && <div className="error-message">⚠️ {error}</div>}

      <section className="section">
        <h3>📥 Elections List</h3>
        {Array.isArray(elections) && elections.length > 0 ? (
          <ul>
            {elections.map((e) => (
              <li key={e._id}>
                🗳️ {e.title} ({e.status})
              </li>
            ))}
          </ul>
        ) : (
          <p>🧾 No elections available</p>
        )}
      </section>

      <section className="section">
        <h3>📈 Real-Time Vote Tally</h3>
        {Object.keys(grouped).length === 0 ? (
          <p>Loading chart...</p>
        ) : (
          Object.entries(grouped).map(([title, candidates]) => {
            const data = {
              labels: Object.keys(candidates),
              datasets: [
                {
                  label: `${title}`,
                  data: Object.values(candidates),
                  backgroundColor: "#3b82f6"
                }
              ]
            };

            const options = {
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: {
                  display: true,
                  text: `Votes for "${title}"`
                }
              }
            };

            return (
              <div key={title} className="chart-container">
                <Bar data={data} options={options} />
              </div>
            );
          })
        )}
      </section>

      <section className="section">
        <h3>📜 Vote Logs</h3>
        <button className="export-btn" onClick={downloadCSV}>
          ⬇️ Export as CSV
        </button>

        {logs.length === 0 ? (
          <p>🧾 No vote logs found yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Election</th>
                <th>Candidate</th>
                <th>Voter</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.election?.title || "Unknown"}</td>
                  <td>{log.candidate?.name || "Unknown"}</td>
                  <td>{log.user?.username || "N/A"}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AuditorDashboard;
