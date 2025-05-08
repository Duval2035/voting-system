import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CreatePoll.css';

function CreatePoll() {
  const [pollName, setPollName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send POST request to backend API to create a new poll
    console.log({ pollName, startDate, endDate });
  };

  return (
    <div className="create-poll-container">
      <Navbar />
      <div className="create-poll-form">
        <h2>Create a New Election</h2>
        <form onSubmit={handleSubmit}>
          <label>Election Title</label>
          <input
            type="text"
            value={pollName}
            onChange={(e) => setPollName(e.target.value)}
            required
          />
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <button type="submit">Create Election</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default CreatePoll;
