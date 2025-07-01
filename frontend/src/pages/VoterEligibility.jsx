import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./VoterEligibility.css";

const VoterEligibility = () => {
  const [users, setUsers] = useState([]); // Users eligible to be assigned (or all users initially)
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [selectedVoters, setSelectedVoters] = useState([]); // IDs of selected voters
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch all voters and elections on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMessage("");
      try {
        const [userRes, electionRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/voters`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/admin/elections`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok || !electionRes.ok) {
          throw new Error("Failed to fetch users or elections");
        }

        const usersData = await userRes.json();
        const electionsData = await electionRes.json();

        setUsers(usersData.voters || []);
        setElections(electionsData || []);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setMessage("❌ Failed to load voters or elections.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setMessage("⚠️ Missing authorization token.");
    }
  }, [token]);

  // Fetch eligible voters when selected election changes
  useEffect(() => {
    if (!selectedElection) {
      setUsers([]);
      setSelectedVoters([]);
      return;
    }

    const fetchEligibleVoters = async () => {
      setLoading(true);
      setMessage("");
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/elections/${selectedElection}/eligible-voters`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }

        const data = await res.json();

        if (data.eligibleVoters) {
          setUsers(data.eligibleVoters);
          setSelectedVoters([]);
        } else {
          setUsers([]);
          setSelectedVoters([]);
        }
      } catch (error) {
        console.error("❌ Error fetching eligible voters:", error);
        setMessage("❌ Failed to load eligible voters.");
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleVoters();
  }, [selectedElection, token]);

  // Toggle voter selection checkbox
  const toggleSelect = (userId) => {
    setSelectedVoters((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Assign selected voters to election
  const assignVoters = async () => {
    if (!selectedElection) {
      setMessage("⚠️ Please select an election.");
      return;
    }
    if (selectedVoters.length === 0) {
      setMessage("⚠️ Please select at least one voter.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/elections/${selectedElection}/assign-voters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ voterIds: selectedVoters }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} - ${text}`);
      }

      setMessage("✅ Voters assigned successfully.");

      // Remove assigned voters from current list
      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selectedVoters.includes(user._id))
      );
      setSelectedVoters([]);
    } catch (err) {
      console.error("❌ Error assigning voters:", err);
      setMessage("❌ Failed to assign voters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eligibility-container">
      <h2>✔️ Assign Voter Eligibility</h2>

      {message && <p className="message">{message}</p>}

      <label htmlFor="election-select">Choose Election:</label>
      <select
        id="election-select"
        value={selectedElection}
        onChange={(e) => setSelectedElection(e.target.value)}
      >
        <option value="">-- Select Election --</option>
        {elections.map((el) => (
          <option key={el._id} value={el._id}>
            {el.title} ({new Date(el.startDate).toLocaleDateString()} -{" "}
            {new Date(el.endDate).toLocaleDateString()})
          </option>
        ))}
      </select>

      <h3>Select Voters:</h3>
      {loading ? (
        <p>Loading voters...</p>
      ) : users.length === 0 ? (
        <p>No voters available for this election.</p>
      ) : (
        <ul className="voter-list">
          {users.map((user) => (
            <li key={user._id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedVoters.includes(user._id)}
                  onChange={() => toggleSelect(user._id)}
                />
                {user.username} ({user.email})
              </label>
            </li>
          ))}
        </ul>
      )}

      <button onClick={assignVoters} disabled={loading}>
        ✅ Assign Selected Voters
      </button>
      <button onClick={() => navigate("/admin/dashboard")} disabled={loading}>
        ⬅️ Back to Dashboard
      </button>
    </div>
  );
};

export default VoterEligibility;
