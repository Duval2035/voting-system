import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./SendMessages.css";

const SendMessages = ({ electionId }) => {
  const [voters, setVoters] = useState([]);
  const [selected, setSelected] = useState([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  console.log("🔑 Token:", token);
  console.log("🗳️ Election ID (Note: Fetching all voters regardless):", electionId); // Updated log message

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        // Always fetch all voters from the general voters endpoint
        const url = `${API_BASE_URL}/admin/voters`; 

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Failed to fetch voters:", response.status, errorText);
          throw new Error(`Failed to load voters: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched voter data raw:", data);

        let voterList = [];
        if (data && Array.isArray(data.voters)) {
          voterList = data.voters;
        } else if (data && Array.isArray(data)) {
          voterList = data;
        } else {
          console.warn("⚠️ Fetched data is not an array or does not contain a 'voters' array:", data);
          voterList = [];
        }

        setVoters(voterList);
      } catch (error) {
        console.error("❌ JSON parse or fetch error:", error.message);
        setStatus(`Error loading voters: ${error.message}`);
        setVoters([]);
      }
    };

    if (token) {
      fetchVoters();
    } else {
      setStatus("⚠️ No authorization token found. Please log in.");
      navigate("/login");
    }
  }, [token, electionId, navigate]);

  const toggleSelect = (email) => {
    setSelected((prevSelected) =>
      prevSelected.includes(email)
        ? prevSelected.filter((e) => e !== email)
        : [...prevSelected, email]
    );
  };

  const handleSelectAll = () => {
    if (Array.isArray(voters)) {
      setSelected(voters.map((voter) => voter.email));
    } else {
      console.warn("Cannot select all: voters is not an array.");
      setSelected([]);
    }
  };

  const handleDeselectAll = () => {
    setSelected([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject || !content || selected.length === 0) {
      setStatus("⚠️ Please fill all fields and select at least one voter.");
      return;
    }

    const payload = { subject, content, recipients: selected };
    console.log("📤 Sending message payload:", payload);

    try {
      const res = await fetch(`${API_BASE_URL}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("✅ Server response:", result);

      if (!res.ok) throw new Error(result.message || `Server error: ${res.status}`);
      setStatus("✅ Message sent successfully!");
      setSubject("");
      setContent("");
      setSelected([]);
    } catch (err) {
      console.error("❌ Send failed:", err.message);
      setStatus(`❌ Failed to send message. ${err.message}`);
    }
  };

  return (
    <div className="send-messages-container">
      <aside className="admin-sidebar">
        <h2>✉️ Send Messages</h2>
        <ul>
          <li onClick={() => navigate("/admin/dashboard")}>🏠 Dashboard</li>
          <li onClick={() => navigate("/admin/voters")}>👥 Voters</li>
          {electionId && (
            <li onClick={() => navigate(`/admin/elections/${electionId}`)}>
              📊 Election Details
            </li>
          )}
        </ul>
      </aside>

      <main className="send-messages-main">
        <h1>Send Message to Voters</h1>
        {status && <p className="status-msg">{status}</p>}

        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <textarea
            placeholder="Message content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
          <button type="submit">📨 Send Message</button>
        </form>

        <h3>Select Recipients:</h3>

        <div className="select-buttons">
          <button type="button" onClick={handleSelectAll}>
            ✅ Select All
          </button>
          <button type="button" onClick={handleDeselectAll}>
            ❌ Deselect All
          </button>
        </div>

        <div className="voter-list">
          {Array.isArray(voters) && voters.length === 0 ? (
            <p>{token ? "No voters found for this election or general list." : "Please log in to view voters."}</p>
          ) : (
            Array.isArray(voters) && voters.map((voter) => (
              <label key={voter._id}>
                <input
                  type="checkbox"
                  checked={selected.includes(voter.email)}
                  onChange={() => toggleSelect(voter.email)}
                />
                {voter.username || voter.name} ({voter.email})
              </label>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default SendMessages;
