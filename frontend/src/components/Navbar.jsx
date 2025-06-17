// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let user;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo-brand">
        <div className="navbar-logo">Z</div>
        <div className="navbar-brand">ZeroFraud Vote</div>
      </div>

      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>

        {!token && (
          <>
            <li><Link to="/login">Log In</Link></li>
            <li><Link to="/register" className="signup-btn">Sign Up</Link></li>
          </>
        )}

        {token && user?.role === "admin" && (
          <>
            <li><Link to="/admin/dashboard">Admin</Link></li>
            <li><Link to="/create-election">Create Election</Link></li>
            <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        )}

        {token && user?.role === "user" && (
          <>
            <li><Link to="/user/dashboard">User</Link></li>
            <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        )}

        {token && user?.role === "auditor" && (
          <>
            <li><Link to="/auditor">Dashboard</Link></li>
            <li><Link to="/auditor/integrity">Integrity</Link></li>
            <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        )}

        {token && user?.role === "candidate" && (
          <>
            <li><Link to="/candidate/dashboard">Candidate Dashboard</Link></li>
            <li><Link to="/candidate/results">My Results</Link></li>
            <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
