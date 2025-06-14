import React, { useEffect, useState } from "react";
import styles from "./AdminVoterList.module.css";

function AdminVoterList() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

useEffect(() => {
  async function fetchElections() {
    if (!token) {
      setError("No token provided. Please login.");
      return;
    }

    try {
      const res = await fetch("/api/admin/elections", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type");

      // SAFEGUARD: log response before parsing
      const text = await res.text();
      console.log("📦 Raw election response:", text);

      // Try JSON parse only if content-type is correct
      if (contentType && contentType.includes("application/json")) {
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.message || "Failed to fetch elections");
        setElections(data);
        setError(null);
      } else {
        throw new Error("Response is not valid JSON.");
      }
    } catch (err) {
      console.error("Election fetch error:", err.message);
      setError(err.message);
      setElections([]);
    }
  }

  fetchElections();
}, [token]);

  useEffect(() => {
    if (!token) {
      setError("No token provided. Please login.");
      return;
    }
    if (!selectedElection) {
      setVoters([]);
      setError(null);
      return;
    }

    async function fetchVoters() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/voters-by-election/${selectedElection}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Failed to parse voter data");
        }

        if (!res.ok) throw new Error(data.message || "Failed to fetch voters");

        setVoters(data.voters || []);
      } catch (err) {
        setError(err.message);
        setVoters([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVoters();
  }, [selectedElection, token]);

  function exportToCSV() {
    if (voters.length === 0) return;
    const csvRows = [["Name", "Email"], ...voters.map(v => [v.name, v.email])];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map(row => row.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `voters-election-${selectedElection}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className={styles.container}>
      <h1>🧑‍🤝‍🧑 Registered Voters</h1>

      {error && <p className={styles.error}>❌ Error: {error}</p>}

      <label htmlFor="electionSelect" className={styles.label}>
        Select Election:
      </label>
      <select
        id="electionSelect"
        value={selectedElection}
        onChange={e => setSelectedElection(e.target.value)}
        className={styles.select}
      >
        <option value="">-- Choose an election --</option>
        {elections.map(election => (
          <option key={election._id} value={election._id}>
            {election.title}
          </option>
        ))}
      </select>

      {loading && <p>Loading voters...</p>}

      {!loading && voters.length > 0 && (
        <>
          <p>Total voters: <strong>{voters.length}</strong></p>
          <button onClick={exportToCSV} className={styles.exportBtn}>
            Export to CSV
          </button>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((voter, idx) => (
                <tr key={voter._id || idx}>
                  <td>{voter.name}</td>
                  <td>{voter.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {!loading && selectedElection && voters.length === 0 && (
        <p>No voters found for this election.</p>
      )}
    </div>
  );
}

export default AdminVoterList;
