import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // Simulated fetch from backend (replace with real API call)
  useEffect(() => {
    fetch('/api/elections') // replace with your actual endpoint
      .then(res => res.json())
      .then(data => setElections(data))
      .catch(err => console.error(err));
  }, []);

  const filteredElections = elections.filter(election => {
    if (filter === 'all') return true;
    return election.status.toLowerCase() === filter;
  });

  const stats = {
    total: elections.length,
    active: elections.filter(e => e.status === 'Active').length,
    voters: elections.reduce((sum, e) => sum + e.totalVoters, 0),
    votes: elections.reduce((sum, e) => sum + e.totalVotes, 0),
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Manage elections and view results</p>

      <div className="dashboard-stats">
        <div className="stat-box">Total Elections<br />{stats.total}</div>
        <div className="stat-box">Active Elections<br />{stats.active}</div>
        <div className="stat-box">Total Voters<br />{stats.voters}</div>
        <div className="stat-box">Total Votes<br />{stats.votes}</div>
        <button className="create-btn" onClick={() => navigate('/create-election')}>
          + Create New Election
        </button>
      </div>

      <div className="tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Elections</button>
        <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
        <button className={filter === 'upcoming' ? 'active' : ''} onClick={() => setFilter('upcoming')}>Upcoming</button>
      </div>

      <div className="election-list">
        {filteredElections.map(election => (
          <div key={election._id} className="election-card">
            <div className="election-header">
              <h3>{election.title}</h3>
              <span className={`status-badge ${election.status.toLowerCase()}`}>{election.status}</span>
            </div>
            <p className="org-name">{election.organization}</p>
            <p className="description">{election.description}</p>
            <p className="dates">📅 {election.startDate} – {election.endDate}</p>
            <div className="election-actions">
              <button onClick={() => navigate(`/results/${election._id}`)}>View Results</button>
              <button onClick={() => navigate(`/manage-election/${election._id}`)}>Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
