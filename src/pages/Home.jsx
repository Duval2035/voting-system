import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-text">
          <h1>Secure Voting Platform for All Organizations</h1>
          <p>
            ZeroFraud Vote ensures transparent, accessible, and fraud-proof elections for
            organizations across all industries and Enterprices in Cameroon.
          </p>
          <div className="hero-buttons">
            <button className="get-started" onClick={() => navigate("/register")}>Get Started</button>
            <button className="login" onClick={() => navigate("/login")}>Log In</button>
          </div>
        </div>

        <div className="results-board">
          <h3>Live Results</h3>
          <div className="result-row">
            <span></span>
            <div className="bar-container teal"><div className="bar" style={{ width: "48%" }}></div></div>
            <span>48%</span>
          </div>
          <div className="result-row">
            <span></span>
            <div className="bar-container blue"><div className="bar" style={{ width: "36%" }}></div></div>
            <span>36%</span>
          </div>
          <div className="result-row">
            <span></span>
            <div className="bar-container orange"><div className="bar" style={{ width: "16%" }}></div></div>
            <span>16%</span>
          </div>
          <small className="updated">Updated 2 mins ago</small>
        </div>
      </section>
    </div>
  );
};

export default Home;
