// src/pages/AuditorResults.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import API_BASE_URL from "../config";
import "./AuditorResults.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AuditorResults = () => {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [electionTitle, setElectionTitle] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchResults = async () => {
      setError("");
      try {
        if (!id) throw new Error("Invalid election ID.");

        // Fetch results
        const resultsRes = await fetch(`${API_BASE_URL}/votes/results/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!resultsRes.ok) {
          const errData = await resultsRes.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to fetch results.");
        }
        const resultsData = await resultsRes.json();
        setResults(resultsData);

        // Fetch election info
        const electionRes = await fetch(`${API_BASE_URL}/elections/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!electionRes.ok) {
          const errData = await electionRes.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to fetch election info.");
        }
        const electionData = await electionRes.json();
        setElectionTitle(electionData.title || "");
      } catch (err) {
        console.error("Failed to load election results:", err);
        setError("❌ " + err.message);
        setResults([]);
        setElectionTitle("");
      }
    };

    fetchResults();
  }, [id, token]);

  const chartData = {
    labels: results.map((c) => c.name),
    datasets: [
      {
        label: "Votes",
        data: results.map((c) => c.votes),
        backgroundColor: "#2563eb",
      },
    ],
  };

  const downloadCSV = () => {
    if (!results.length) return;

    const rows = [["Candidate", "Votes"]];
    results.forEach((c) => rows.push([c.name, c.votes]));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `${electionTitle || "election_results"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="auditor-results">
      <h2>📊 Results for {electionTitle || "Loading..."}</h2>

      {error && <p className="error-message">{error}</p>}

      {!error && results.length === 0 && <p>No votes recorded yet.</p>}

      {results.length > 0 && (
        <>
          <div className="chart-wrapper">
            <Bar data={chartData} />
          </div>

          <div className="actions">
            <button onClick={downloadCSV}>📄 Export CSV</button>
            <button onClick={() => window.print()}>🖨️ Print</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditorResults;
