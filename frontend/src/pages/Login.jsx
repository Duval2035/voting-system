import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy logic: Replace with actual authentication logic
    const userRole = "user"; // Or "admin" based on login credentials

    if (userRole === "user") {
      navigate("/user/dashboard");
    } else if (userRole === "admin") {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <p>
          Don't have an account? <span className="login"> <a href="/register">Register here</a> </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
