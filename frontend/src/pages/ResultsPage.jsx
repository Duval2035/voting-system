// src/pages/ResultsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import "./ResultsPage.css";
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

const ResultsPage = () => {
  const { electionId } = useParams();
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Safe JSON parse helper
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

  useEffect(() => {
    const fetchResults = async () => {
      if (!electionId) {
        setError("Election ID is missing in the URL.");
        setResults([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/votes/results/${electionId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        const data = await safeJsonParse(response);

        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch results.");
        }

        setResults(data || []);
        setError("");
      } catch (err) {
        console.error("❌ Failed to load results:", err);
        setError(err.message || "Failed to load results.");
        setResults([]);
      }
    };

    fetchResults();
  }, [electionId, token]);

  // Calculate total votes for tooltip percentage calculation
  const totalVotes = results.reduce((sum, candidate) => sum + candidate.votes, 0);

  const chartData = {
    labels: results.map((c) => c.name),
    datasets: [
      {
        label: "Votes",
        data: results.map((c) => c.votes),
        backgroundColor: "#007bff",
        borderColor: "#0056b3",
        borderWidth: 2,
      },
    ],
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
      y: {
        beginAtZero: true,
        precision: 0,
      },
    },
  };

  return (
    <div className="results-page">
      <h2>📊 Election Results</h2>

      {error && <p className="error-message">{error}</p>}

      {!error && results.length === 0 && <p>No results yet.</p>}

      {!error && results.length > 0 && (
        <>
          <div className="bar-chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="result-cards">
            {results.map((candidate) => {
              // Handle image URL - if relative path, prepend API_BASE_URL
              let imageUrl = candidate.image || "/default-user.png";
              if (imageUrl.startsWith("/uploads/") || imageUrl.startsWith("/images/")) {
                imageUrl = `${API_BASE_URL}${imageUrl}`;
              }

              return (
                <div className="result-card" key={candidate._id}>
                  <img src={imageUrl} alt={candidate.name} className="result-image" />
                  <div className="result-details">
                    <h4>{candidate.name}</h4>
                    <p><strong>{candidate.position}</strong></p>
                    <p>{candidate.votes} vote(s)</p>
                  </div>
                </div>
              );
            })}
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
