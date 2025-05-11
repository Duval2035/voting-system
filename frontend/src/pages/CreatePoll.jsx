import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CreatePoll.css";

const CreatePoll = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Poll "${title}" created successfully!`);
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div>
      <Navbar />
      <div className="create-poll-container">
        <h2>Create a New Poll</h2>
        <form onSubmit={handleSubmit} className="create-poll-form">
          <label htmlFor="title">Poll Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label htmlFor="start">Start Date</label>
          <input
            type="date"
            id="start"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label htmlFor="end">End Date</label>
          <input
            type="date"
            id="end"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <button type="submit">Create Poll</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePoll;
