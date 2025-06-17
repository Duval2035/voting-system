import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config"; // Make sure this exports the base URL as a string

const VerifyOtp = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const email = localStorage.getItem("otpEmail");

    if (!email) {
      setError("No email found. Please request an OTP first.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to verify OTP.");
        return;
      }

      // Save auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.organizationName) {
        localStorage.setItem("organizationName", data.user.organizationName);
      }

      setMessage("✅ OTP Verified. Redirecting...");

      setTimeout(() => {
        const { role } = data.user;
        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "user") navigate("/user/dashboard");
        else if (role === "auditor") navigate("/auditor");
        else if (role === "candidate") navigate("/candidate/dashboard");
        else navigate("/unauthorized");
      }, 1500);
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter the OTP code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Verify</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default VerifyOtp;
