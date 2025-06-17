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

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!electionId) {
          throw new Error("Election ID is missing in the URL.");
        }

        const response = await fetch(`/api/votes/results/${electionId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch results.");
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("❌ Failed to load results:", err);
        setError(err.message);
      }
    };

    fetchResults();
  }, [electionId]);

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
          label: (context) =>
            `${context.parsed.y} votes (${(
              (context.parsed.y / totalVotes) *
              100
            ).toFixed(1)}%)`,
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
      {results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <>
          <div className="bar-chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="result-cards">
            {results.map((candidate) => {
              const imageUrl = candidate.image?.startsWith("/uploads/")
                ? `${API_BASE_URL}${candidate.image}`
                : candidate.image;

              return (
                <div className="result-card" key={candidate._id}>
                  <img
                    src={imageUrl}
                    alt={candidate.name}
                    className="result-image"
                  />
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
