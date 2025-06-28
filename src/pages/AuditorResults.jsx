import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import API_BASE_URL from "../config";
import "./AuditorResults.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AuditorResults = () => {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [electionTitle, setElectionTitle] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/votes/results/${id}`);
        const data = await res.json();
        if (res.ok) {
          setResults(data);
        }

        // Get election title
        const electionRes = await fetch(`${API_BASE_URL}/elections/${id}`);
        const electionData = await electionRes.json();
        setElectionTitle(electionData.title || "");
      } catch (err) {
        console.error("Failed to load election results:", err);
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
        backgroundColor: "#2563eb"
      }
    ]
  };

  const downloadCSV = () => {
    const rows = [["Candidate", "Votes"]];
    results.forEach((c) => rows.push([c.name, c.votes]));

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${electionTitle}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="auditor-results">
      <h2>📊 Results for {electionTitle}</h2>

      {results.length === 0 ? (
        <p>No votes recorded yet.</p>
      ) : (
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
