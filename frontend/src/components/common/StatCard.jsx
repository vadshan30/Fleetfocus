import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, title, value, trend, trendLabel }) => {
  return (
    <div className="ff-card ff-card-hoverable stat-card">
      <div className="stat-card-header">
        {icon && <div className="stat-icon">{icon}</div>}
        <h3 className="stat-title">{title}</h3>
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-neutral'}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '−'} {Math.abs(trend)}%
            {trendLabel && <span className="trend-label">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
