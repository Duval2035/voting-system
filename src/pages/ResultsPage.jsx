// src/pages/ResultsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import API_BASE_URL from "../config";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./ResultsPage.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ResultsPage = () => {
  const { electionId } = useParams();
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/votes/results/${electionId}`);
        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("❌ Failed to load results:", err);
        setError(err.message);
      }
    };

    fetchResults();
  }, [electionId]);

  const totalVotes = results.reduce((sum, c) => sum + c.voteCount, 0);

  const chartData = {
    labels: results.map((c) => c.name),
    datasets: [{
      label: "Votes",
      data: results.map((c) => c.voteCount),
      backgroundColor: "#007bff",
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const votes = context.parsed.y;
            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0";
            return `${votes} vote(s) (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, precision: 0 },
    },
  };

  return (
    <div className="results-page">
      <h2>📊 Results for Election #{electionId}</h2>
      {error && <p className="error-message">{error}</p>}
      {!error && results.length === 0 && <p>No results yet.</p>}

      {!error && results.length > 0 && (
        <>
          <div className="bar-chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="result-cards">
            {results.map((c) => (
              <div className="result-card" key={c._id}>
                <img src={`http://localhost:5000${c.image}`} alt={c.name} className="result-image" />
                <div className="result-details">
                  <h4>{c.name}</h4>
                  <p><strong>{c.position}</strong></p>
                  <p>{c.voteCount} vote(s)</p>
                </div>
              </div>
            ))}
          </div>

          <button className="print-btn" onClick={() => window.print()}>
            🖨️ Print Results
          </button>
        </>
      )}
    </div>
  );
};

export default ResultsPage;
