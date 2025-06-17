import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const API_BASE_URL = "http://localhost:5000/api/auth";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    organizationName: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "email" ? value.trim().toLowerCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // Store data if a token is returned (depends on backend implementation)
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("organizationName", data.user.organizationName);
        navigate(data.user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
      } else {
        setMessage("✅ Registered successfully. You can now log in.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("❌ Could not connect to server");
    }
  };

  return (
    <div className="auth-container">
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Username</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label>Password</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <label>Organization Name</label>
        <input
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          required
        />
        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">Regular User</option>
          <option value="admin">Administrator</option>
          <option value="auditor">Auditor</option>
          <option value="candidate">Candidate</option>
        </select>
        <button type="submit">Register</button>
      </form>

      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}

      <p className="footer-link">
        Already have an account?{" "}
        <Link to="/login">
          <span className="footer-if">Login</span>
        </Link>
      </p>
    </div>
  );
};

export default Register;
