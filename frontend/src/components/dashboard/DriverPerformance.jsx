import React from 'react';
import { useNavigate } from 'react-router-dom';

const DriverPerformance = ({ trips = [], drivers = [] }) => {
  const navigate = useNavigate();

  const driverStats = drivers.map(driver => {
    const driverTrips = trips.filter(t => t.driver?.id === driver.id);
    const completedTrips = driverTrips.filter(t => t.status === 'COMPLETED');
    const totalDistance = completedTrips.reduce((sum, t) => sum + (t.distanceCovered || 0), 0);
    const avgDistance = completedTrips.length > 0 ? totalDistance / completedTrips.length : 0;
    const totalTrips = driverTrips.length;

    return {
      ...driver,
      totalTrips,
      completedTrips: completedTrips.length,
      totalDistance,
      avgDistance,
      efficiency: completedTrips.length > 0 ? (totalDistance / completedTrips.length) : 0,
      mostRecentTrip: driverTrips.length > 0 ? driverTrips[driverTrips.length - 1] : null
    };
  });

  const activeDrivers = driverStats.filter(d => d.totalTrips > 0);
  const sortedByDistance = [...activeDrivers].sort((a, b) => b.totalDistance - a.totalDistance);
  const sortedByTrips = [...activeDrivers].sort((a, b) => b.totalTrips - a.totalTrips);

  const totalTripsAll = trips.filter(t => t.status === 'COMPLETED').length;
  const totalDistanceAll = trips.reduce((sum, t) => sum + (t.distanceCovered || 0), 0);
  const avgTripDistance = totalTripsAll > 0 ? totalDistanceAll / totalTripsAll : 0;

  const stats = [
    {
      label: 'Total Distance',
      value: `${totalDistanceAll.toFixed(0)} km`,
      icon: '📏',
      color: '#2b5ce6',
      subtext: `From ${totalTripsAll} trips`
    },
    {
      label: 'Active Drivers',
      value: activeDrivers.length,
      icon: '👤',
      color: '#16a34a',
      subtext: `${drivers.length} total drivers`
    },
    {
      label: 'Avg Trip Distance',
      value: `${avgTripDistance.toFixed(1)} km`,
      icon: '📊',
      color: '#f59e0b',
      subtext: 'Per completed trip'
    },
    {
      label: 'Most Active Driver',
      value: sortedByTrips.length > 0 ? sortedByTrips[0].user?.username || 'N/A' : 'N/A',
      icon: '🏆',
      color: '#7c3aed',
      subtext: sortedByTrips.length > 0 ? `${sortedByTrips[0].totalTrips} trips` : 'No trips'
    },
  ];

  return (
    <div className="ff-card" style={{ marginBottom: 24 }}>
      {/* Header */}
      <div className="ff-card-header">
        <div className="ff-card-header-left">
          <div
            className="ff-card-icon"
            style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' }}
          >
            👤
          </div>
          <div>
            <h3 className="ff-card-title">Driver Performance</h3>
            <div className="ff-card-subtitle">
              {activeDrivers.length > 0
                ? `${activeDrivers.length} driver${activeDrivers.length > 1 ? 's' : ''} active`
                : 'No driver activity yet'}
            </div>
          </div>
        </div>
        <span className="ff-card-badge">
          📅 {totalTripsAll} completed trips
        </span>
      </div>

      {/* Empty state */}
      {activeDrivers.length === 0 ? (
        <div className="ff-empty">
          <div className="ff-empty-icon">👤</div>
          <div className="ff-empty-title">No driver activity yet</div>
          <div className="ff-empty-text">
            Complete trips to see driver performance analytics
          </div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="ff-fuel-grid" style={{ marginBottom: 24 }}>
            {stats.map((stat, i) => (
              <div
                key={i}
                className="ff-fuel-metric"
                style={{ borderLeftColor: stat.color }}
              >
                <div className="ff-fuel-metric-top">
                  <div className="ff-fuel-metric-icon">{stat.icon}</div>
                  <div className="ff-fuel-metric-label">{stat.label}</div>
                </div>
                <div className="ff-fuel-metric-value">{stat.value}</div>
                <div className="ff-fuel-metric-sub">{stat.subtext}</div>
              </div>
            ))}
          </div>

          {/* Two-column rankings */}
          <div className="ff-grid-row" style={{ marginBottom: 0 }}>
            {/* Top Drivers by Distance */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  color: '#5a6884',
                  marginBottom: '14px',
                  textTransform: 'uppercase'
                }}
              >
                📏 Top Drivers by Distance
              </div>

              {sortedByDistance.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0' }}>
                  No data available
                </div>
              ) : (
                <div className="ff-ranking-list">
                  {sortedByDistance.slice(0, 5).map((driver, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                    const tagClass = i === 0 ? 'ff-tag-gold' : i === 1 ? 'ff-tag-blue' : 'ff-tag-gray';
                    const tagLabel = i === 0 ? 'BEST' : i === 1 ? 'GOOD' : 'ACTIVE';
                    return (
                      <div
                        key={driver.id}
                        className={`ff-rank-row ${i < 3 ? `top-${i + 1}` : ''}`}
                        onClick={() => navigate('/drivers')}
                      >
                        <div className="ff-rank-left">
                          <span className="ff-rank-medal">{medal}</span>
                          <div className="ff-rank-info">
                            <div className="ff-rank-name">
                              {driver.user?.username || 'Unknown'}
                            </div>
                            <div className="ff-rank-sub">
                              {driver.completedTrips} trips completed
                            </div>
                          </div>
                        </div>
                        <div className="ff-rank-right">
                          <span className="ff-rank-value">
                            {driver.totalDistance.toFixed(0)} km
                          </span>
                          <span className={`ff-rank-tag ${tagClass}`}>{tagLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Drivers by Trips */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  color: '#5a6884',
                  marginBottom: '14px',
                  textTransform: 'uppercase'
                }}
              >
                📋 Top Drivers by Trips
              </div>

              {sortedByTrips.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0' }}>
                  No data available
                </div>
              ) : (
                <div className="ff-ranking-list">
                  {sortedByTrips.slice(0, 5).map((driver, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                    const tagClass = i === 0 ? 'ff-tag-gold' : i === 1 ? 'ff-tag-blue' : 'ff-tag-gray';
                    const tagLabel = i === 0 ? 'MOST ACTIVE' : i === 1 ? 'ACTIVE' : 'REGULAR';
                    return (
                      <div
                        key={driver.id}
                        className={`ff-rank-row ${i < 3 ? `top-${i + 1}` : ''}`}
                        onClick={() => navigate('/drivers')}
                      >
                        <div className="ff-rank-left">
                          <span className="ff-rank-medal">{medal}</span>
                          <div className="ff-rank-info">
                            <div className="ff-rank-name">
                              {driver.user?.username || 'Unknown'}
                            </div>
                            <div className="ff-rank-sub">
                              {driver.totalDistance.toFixed(0)} km driven
                            </div>
                          </div>
                        </div>
                        <div className="ff-rank-right">
                          <span className="ff-rank-value">
                            {driver.totalTrips} trips
                          </span>
                          <span className={`ff-rank-tag ${tagClass}`}>{tagLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '12px',
          color: '#94a3b8'
        }}
      >
        <span>👤 {activeDrivers.length} active drivers</span>
        <span>📊 Avg efficiency: {avgTripDistance.toFixed(1)} km/trip</span>
        <span>💡 Click a driver card to view details</span>
      </div>
    </div>
  );
};

export default DriverPerformance;