import React from 'react';
import './ErrorState.css';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h3 className="error-title">Something went wrong</h3>
        <p className="error-message">{message || 'An unexpected error occurred.'}</p>
      </div>
      {onRetry && (
        <button className="ff-btn ff-btn-secondary error-retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
