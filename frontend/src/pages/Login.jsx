import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const API_BASE_URL = "http://localhost:5000/api/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = verify OTP
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setStep(2);
    } catch (err) {
      setError("Could not connect to server");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not verify OTP");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("organizationName", data.user.organizationName);
      localStorage.setItem("organizationId", data.user.organizationId || "");
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } catch (err) {
      setError("Could not connect to server");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="login-form">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {step === 2 && (
          <>
            <label>OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </>
        )}

        <button type="submit">{step === 1 ? "Send OTP" : "Verify OTP"}</button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      <p className="footer-link">
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
