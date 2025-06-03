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
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/votes/results/${id}`);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setResults(data);
        const total = data.reduce((sum, c) => sum + c.votes, 0);
        setTotalVotes(total);
      } else {
        setResults([]);
        setTotalVotes(0);
        const errText = await res.text();
        console.error("❌ Failed to load results:", errText);
      }
    } catch (err) {
      console.error("❌ Error fetching results:", err);
    }
  };

  fetchResults();
}, [id]);

  const chartData = {
    labels: results.map((c) => c.name),
    datasets: [
      {
        label: "Votes",
        data: results.map((c) => c.votes),
        backgroundColor: "#007bff",
        borderColor: "#0056b3",
        borderWidth: 1,
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
