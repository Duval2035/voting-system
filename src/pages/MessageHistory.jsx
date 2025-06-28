import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import "./MessageHistory.css";

const MessageHistory = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/messages/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching message history:", err.message);
        setError("⚠️ Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="message-container">
      <h2 className="message-heading">📨 Sent Messages History</h2>

      {error && <p className="message-error">{error}</p>}
      {loading ? (
        <p className="message-loading">Loading message history...</p>
      ) : messages.length === 0 ? (
        <p className="message-empty">No messages sent yet.</p>
      ) : (
        <div className="message-table-wrapper">
          <table className="message-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Content</th>
                <th>Recipients</th>
                <th>Date Sent</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg._id}>
                  <td>{msg.subject}</td>
                  <td>{msg.content}</td>
                  <td>{msg.recipients?.join(", ")}</td>
                  <td>{new Date(msg.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MessageHistory;
