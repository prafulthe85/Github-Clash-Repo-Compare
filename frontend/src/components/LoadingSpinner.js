import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-text">Analyzing profiles...</p>
        <p className="loading-subtext">This may take a moment</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

