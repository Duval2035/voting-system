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
        if (res.ok) {
          setResults(data);
          const total = data.reduce((sum, c) => sum + c.votes, 0);
          setTotalVotes(total);
        }
      } catch (err) {
        console.error("Failed to load results", err);
      }
    };

    fetchResults();
  }, [id]);

  return (
    <div className="results-page">
      <h2>📊 Election Results</h2>

      {results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <>
          <div className="result-cards">
            {results.map((candidate) => {
              const percentage = totalVotes
                ? ((candidate.votes / totalVotes) * 100).toFixed(1)
                : 0;

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
                    <div className="progress-bar-wrapper">
                      <div
                        className="progress-bar"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="vote-count">
                      {candidate.votes} vote(s) — {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="results-chart">
            <Bar
              data={{
                labels: results.map((c) => c.name),
                datasets: [
                  {
                    label: "# of Votes",
                    data: results.map((c) => c.votes),
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </>
      )}

      <button className="print-btn" onClick={() => window.print()}>
        🖨️ Print Results
      </button>
    </div>
  );
};

export default ResultsPage;
