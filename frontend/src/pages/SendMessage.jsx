import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "./SendMessages.css";

const SendMessages = ({ electionId }) => { // <-- receive electionId as prop or set it here
  const [voters, setVoters] = useState([]);
  const [selected, setSelected] = useState([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!electionId) {
      console.error("❌ No electionId provided for fetching voters.");
      return;
    }

    const fetchVoters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/voters/by-election/${electionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Failed to fetch voters:", response.status, errorText);
          setStatus("❌ Failed to load voters.");
          return;
        }

        const data = await response.json();
        setVoters(data.voters || []);
        if ((data.voters || []).length === 0) {
          setStatus("No voters found for this election.");
        } else {
          setStatus(null);
        }
      } catch (error) {
        console.error("❌ JSON parse or fetch error:", error.message);
        setStatus("❌ Error loading voters.");
      }
    };

    fetchVoters();
  }, [token, electionId]);

  const toggleSelect = (email) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !content || selected.length === 0) {
      return setStatus("Please fill all fields and select at least one voter.");
    }
    try {
      const res = await fetch(`${API_BASE_URL}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, content, recipients: selected }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setStatus("✅ Message sent successfully!");
      setSubject("");
      setContent("");
      setSelected([]);
    } catch (err) {
      setStatus("❌ Failed to send message.");
    }
  };

  return (
    <div className="send-messages-container">
      <aside className="admin-sidebar">
        <h2>✉️ Send Messages</h2>
        <ul>
          <li onClick={() => navigate("/admin/dashboard")}>🏠 Dashboard</li>
          <li onClick={() => navigate("/admin/voters")}>👥 Voters</li>
          <li onClick={() => navigate("/admin/export-voters")}>📤 Export</li>
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
          />
          <textarea
            placeholder="Message content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          <button type="submit">📨 Send Message</button>
        </form>

        <h3>Select Recipients:</h3>
        <div className="voter-list">
          {voters.length === 0 ? (
            <p>No voters found for this election.</p>
          ) : (
            voters.map((voter) => (
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
