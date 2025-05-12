import React, { useState } from 'react';
import './CreateElection.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CreateElection = () => {
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace this with your API POST request logic
    console.log('Election created:', formData);
    alert('Election created successfully!');
  };

  return (
    <>
    
      <div className="create-election-container">
        <h2>Create New Election</h2>
        <form onSubmit={handleSubmit} className="election-form">
          <label>Election Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g., Board Election 2025"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Organization Name</label>
          <input
            type="text"
            name="organization"
            placeholder="e.g., Cameroon Association"
            value={formData.organization}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Enter details about this election..."
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>

          <div className="date-row">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit">Create Election</button>
        </form>
      </div>
     
    </>
  );
};

export default CreateElection;
