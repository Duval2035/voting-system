// src/components/Navbar.jsx
import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
        <div className="navbar-logo">Z</div>
      <div className="navbar-brand">ZeroFraud vote</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Log In</Link></li>
        <li><Link to="/register" className="signup-btn">Sign Up</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
