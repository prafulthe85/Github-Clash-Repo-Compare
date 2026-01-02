import React, { useState } from 'react';
import './ComparisonForm.scss';

const ComparisonForm = ({ onCompare }) => {
  const [username1, setUsername1] = useState('');
  const [username2, setUsername2] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username1.trim() && username2.trim()) {
      onCompare(username1.trim(), username2.trim());
    }
  };

  return (
    <div className="comparison-form-container">
      <form className="comparison-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="username1">First GitHub Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username1"
                type="text"
                placeholder="e.g., octocat"
                value={username1}
                onChange={(e) => setUsername1(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="vs-divider">
            <span>VS</span>
          </div>

          <div className="input-group">
            <label htmlFor="username2">Second GitHub Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username2"
                type="text"
                placeholder="e.g., defunkt"
                value={username2}
                onChange={(e) => setUsername2(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="compare-button">
          <span>Compare Profiles</span>
          <span className="button-icon">🚀</span>
        </button>
      </form>
    </div>
  );
};

export default ComparisonForm;

