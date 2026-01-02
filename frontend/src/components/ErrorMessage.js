import React from 'react';
import './ErrorMessage.scss';

const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <div className="error-message">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <div className="error-text">
          <h3>Error</h3>
          <p>{message}</p>
        </div>
        {onDismiss && (
          <button className="error-dismiss" onClick={onDismiss}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

