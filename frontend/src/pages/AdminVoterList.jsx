import React, { useEffect, useState } from "react";
import styles from "./AdminVoterList.module.css";

function AdminVoterList() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchElections = async () => {
    if (!token) {
      setError("No token provided. Please login.");
      return;
    }
    try {
      const res = await fetch("/api/admin/elections", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get("content-type");
      const text = await res.text();
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
  };

  const fetchVoters = async (electionId = selectedElection) => {
    if (!token || !electionId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/voters-by-election/${electionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Failed to fetch voters");

      setVoters(data.voters || []);
    } catch (err) {
      setError(err.message);
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, [token]);

  useEffect(() => {
    if (selectedElection) {
      fetchVoters();
    } else {
      setVoters([]);
    }
  }, [selectedElection]);

  function exportToCSV() {
    if (voters.length === 0) return;
    const csvRows = [["Name", "Email"], ...voters.map(v => [v.name, v.email])];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(row => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `voters-election-${selectedElection}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleVoterAdded = async () => {
    await fetchElections();
    await fetchVoters();
  };

  return (
    <div className={styles.container}>
      <h1>🧑‍🤝‍🧑 Registered Voters</h1>

      {error && <p className={styles.error}>❌ {error}</p>}

      <label htmlFor="electionSelect" className={styles.label}>Select Election:</label>
      <select
        id="electionSelect"
        value={selectedElection}
        onChange={e => setSelectedElection(e.target.value)}
        className={styles.select}
      >
        <option value="">-- Choose an election --</option>
        {elections.map(e => (
          <option key={e._id} value={e._id}>{e.title}</option>
        ))}
      </select>

      {loading && <p>Loading voters...</p>}

      {!loading && selectedElection && (
        <>
          <div className={styles.summary}>
            <p><strong>Total voters:</strong> {voters.length}</p>
            <button onClick={exportToCSV} className={styles.exportBtn}>Export to CSV</button>
          </div>

          {voters.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Email</th></tr>
              </thead>
              <tbody>
                {voters.map((v, idx) => (
                  <tr key={v._id || idx}>
                    <td>{v.name}</td>
                    <td>{v.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No voters found for this election.</p>
          )}
        </>
      )}

      <AddVoterForm elections={elections} onVoterAdded={handleVoterAdded} />
    </div>
  );
}

function AddVoterForm({ elections, onVoterAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [electionId, setElectionId] = useState("");
  const [message, setMessage] = useState(null);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch("/api/admin/add-voter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, electionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Voter added.");
      setName("");
      setEmail("");
      setElectionId("");
      onVoterAdded();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className={styles.addVoterBox}>
      <h3>Add New Voter</h3>
      {message && <p className={styles.message}>{message}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select
          value={electionId}
          onChange={(e) => setElectionId(e.target.value)}
          required
        >
          <option value="">-- Select Election --</option>
          {elections.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.addBtn}>➕ Add Voter</button>
      </form>
    </div>
  );
}

export default AdminVoterList;
