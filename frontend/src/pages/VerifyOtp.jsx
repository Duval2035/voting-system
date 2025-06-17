import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config"; // Ensure this is exporting the base URL string

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
      setError("No email found. Request OTP first.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to verify OTP");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.organizationName) {
        localStorage.setItem("organizationName", data.user.organizationName);
      }

      setMessage("OTP Verified. Redirecting...");
      setTimeout(() => {
        switch (data.user.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "user":
            navigate("/user/dashboard");
            break;
          case "auditor":
            navigate("/auditor");
            break;
          case "candidate":
            navigate("/candidate/dashboard");
            break;
          default:
            navigate("/unauthorized");
        }
      }, 1000);
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
