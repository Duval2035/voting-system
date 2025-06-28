import React, { useState } from "react";
import API_BASE_URL from "../config";

const RequestOtp = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        localStorage.setItem("otpEmail", email); // store email for next step
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="form-container">
      <h2>Request OTP</h2>
      <form onSubmit={handleRequestOtp}>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send OTP</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RequestOtp;
