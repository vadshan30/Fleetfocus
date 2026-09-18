import React, { useState, useEffect } from 'react';
import monitoringService from '../../services/monitoringService';
import '../../LiveFleet.css';

const LiveFleet = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchLiveFleet = async () => {
    try {
      const data = await monitoringService.getLiveFleet();
      setFleet(data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching live fleet:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLiveFleet();
    const interval = setInterval(fetchLiveFleet, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="lf-page">
        <div className="lf-loading">
          <div className="lf-spinner" />
          <div className="lf-loading-text">Initializing Live Tracking...</div>
        </div>
      </div>
    );
  }

  const total = fleet.length;
  const onTrip = fleet.filter(v => v.status === 'ON_TRIP').length;
  const available = fleet.filter(v => v.status === 'AVAILABLE').length;
  const maintenance = fleet.filter(v => v.status === 'UNDER_MAINTENANCE').length;

  const getFuelClass = (fuel) => {
    if (fuel >= 60) return 'high';
    if (fuel >= 30) return 'medium';
    return 'low';
  };

  return (
    <div className="lf-page">
      {/* HEADER */}
      <div className="lf-header">
        <div className="lf-header-left">
          <div>
            <h1>Live Fleet Monitoring</h1>
            <p>Real-time status of all vehicles in your fleet</p>
          </div>
          <span className="lf-live-badge">
            <span className="lf-live-dot"></span>
            LIVE
          </span>
        </div>
        <div className="lf-refresh-info">
          <span className="lf-refresh-dot"></span>
          Auto-refresh · {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* STATS */}
      <div className="lf-stats">
        <div className="lf-stat">
          <div className="lf-stat-icon" style={{ background: '#eff6ff', color: '#2b5ce6' }}>🚛</div>
          <div>
            <div className="lf-stat-value">{total}</div>
            <div className="lf-stat-label">Total Fleet</div>
          </div>
        </div>
        <div className="lf-stat">
          <div className="lf-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>📍</div>
          <div>
            <div className="lf-stat-value">{onTrip}</div>
            <div className="lf-stat-label">On Trip</div>
          </div>
        </div>
        <div className="lf-stat">
          <div className="lf-stat-icon" style={{ background: '#ecfdf5', color: '#16a34a' }}>✅</div>
          <div>
            <div className="lf-stat-value">{available}</div>
            <div className="lf-stat-label">Available</div>
          </div>
        </div>
        <div className="lf-stat">
          <div className="lf-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>🔧</div>
          <div>
            <div className="lf-stat-value">{maintenance}</div>
            <div className="lf-stat-label">Maintenance</div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="lf-table-card">
        <table className="lf-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Speed</th>
              <th>Fuel Level</th>
            </tr>
          </thead>
          <tbody>
            {fleet.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: 0 }}>
                  <div className="lf-empty">
                    <div className="lf-empty-icon">🚛</div>
                    <div className="lf-empty-title">No vehicles found</div>
                    <div className="lf-empty-text">Add vehicles to start tracking live data</div>
                  </div>
                </td>
              </tr>
            ) : (
              fleet.map((item, index) => {
                const fuel = item.fuelLevel || 0;
                const speed = item.speed || 0;
                const fuelClass = getFuelClass(fuel);
                const isHighSpeed = speed > 100;

                return (
                  <tr key={item.id || index}>
                    <td>
                      <div className="lf-vehicle-cell">
                        <div className="lf-vehicle-icon">🚛</div>
                        <div className="lf-vehicle-info">
                          <div className="lf-vehicle-plate">
                            {item.licensePlate || 'N/A'}
                          </div>
                          <div className="lf-vehicle-model">
                            {item.model || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`lf-status ${item.status?.toLowerCase()}`}>
                        {item.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td>
                      <span className={`lf-speed ${isHighSpeed ? 'warning' : ''}`}>
                        {speed.toFixed(1)} km/h
                      </span>
                      {isHighSpeed && <span className="lf-speed-icon">⚡</span>}
                    </td>
                    <td>
                      <div className="lf-fuel-wrap">
                        <div className="lf-fuel-bar">
                          <div
                            className={`lf-fuel-fill ${fuelClass}`}
                            style={{ width: `${fuel}%` }}
                          />
                        </div>
                        <span className="lf-fuel-value">{fuel.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveFleet;