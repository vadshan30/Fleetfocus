import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchVehicles } from '../../store/slices/vehicleSlice';
import tripService from '../../services/tripService';
import driverService from '../../services/driverService';
import maintenanceService from '../../services/maintenanceService';
import DriverPerformance from './DriverPerformance';
import '../../Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const vehicles = useSelector((state) => state.vehicles.items);

  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchVehicles({ page: 0, size: 100 }));
    Promise.all([
      tripService.getAll().catch(() => []),
      driverService.getAll().catch(() => []),
      maintenanceService.getAll().catch(() => []),
    ]).then(([tripsData, driversData, logsData]) => {
      setTrips(tripsData || []);
      setDrivers(driversData || []);
      setMaintenanceLogs(logsData || []);
    });
  }, [dispatch, user]);

  if (!user) return null;

  if (user.role === 'DRIVER') {
    return (
      <div className="ff-dashboard">
        <div className="ff-hero-banner">
          <div className="ff-hero-content">
            <div className="ff-hero-text">
              <h1>Welcome back, {user.username}!</h1>
              <p>Ready to start your next journey? Head to your trip log.</p>
            </div>
            <div className="ff-hero-actions">
              <button className="ff-hero-btn-primary" onClick={() => navigate('/trips')}>
                🗺️ Go to Trip Log
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalVehicles = vehicles.length;
  const onTrip = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const maintenance = vehicles.filter(v => v.status === 'UNDER_MAINTENANCE').length;
  const available = vehicles.filter(v => v.status === 'AVAILABLE').length;

  const completedTrips = trips.filter(t => t.status === 'COMPLETED');
  const totalTripDistance = completedTrips.reduce((s, t) => s + (t.distanceCovered || 0), 0);
  const avgFuel = 8.5;
  const fuelUsed = (totalTripDistance / 100) * avgFuel;
  const fuelCost = fuelUsed * 1.8;

  const vehicleTripCounts = {};
  trips.forEach(t => {
    const plate = t.vehicle?.licensePlate;
    if (plate) vehicleTripCounts[plate] = (vehicleTripCounts[plate] || 0) + 1;
  });
  const topVehicles = Object.entries(vehicleTripCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const serviceInterval = 5000;
  const vehiclesWithMaint = vehicles.map(v => {
    const logs = maintenanceLogs.filter(l => l.vehicle?.id === v.id);
    const tripDist = completedTrips
      .filter(t => t.vehicle?.id === v.id)
      .reduce((s, t) => s + (t.distanceCovered || 0), 0);
    const currentMileage = (v.currentMileage || 0) + tripDist;
    const nextService = logs.length > 0
      ? Math.floor((currentMileage / serviceInterval) + 1) * serviceInterval
      : serviceInterval;
    const kmLeft = Math.max(0, nextService - currentMileage);
    return {
      ...v,
      currentMileage,
      kmLeft,
      nextService,
      isOverdue: currentMileage >= nextService,
      isDue: kmLeft < 500 && kmLeft > 0,
    };
  }).filter(v => v.isOverdue || v.isDue);

  const dueSorted = [...vehiclesWithMaint].sort((a, b) => a.kmLeft - b.kmLeft);

  const donutSegments = [
    { id: 'onTrip', label: 'On Trip', value: onTrip, color: '#2b5ce6', hoverColor: '#1e45b8' },
    { id: 'maintenance', label: 'Maintenance', value: maintenance, color: '#f59e0b', hoverColor: '#d97706' },
    { id: 'available', label: 'Available', value: available, color: '#16a34a', hoverColor: '#15803d' },
  ];

  return (
    <div className="ff-dashboard">
      {/* HERO BANNER */}
      <div className="ff-hero-banner">
        <div className="ff-hero-content">
          <div className="ff-hero-text">
            <h1>Real-Time Fleet Management</h1>
            <p>
              Monitor your fleet, track trips, and optimize operations — all in one place. 
              Welcome back, {user.username}!
            </p>
          </div>
          <div className="ff-hero-actions">
            <button className="ff-hero-btn-primary" onClick={() => navigate('/live')}>
              📡 Live Fleet
            </button>
            <button className="ff-hero-btn-secondary" onClick={() => navigate('/trips')}>
              🗺️ View Trips
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="ff-kpi-row">
        <div className="ff-kpi-item" style={{ '--kpi-color': '#2b5ce6' }} onClick={() => navigate('/vehicles')}>
          <div className="ff-kpi-icon-wrap" style={{ background: '#eff6ff', color: '#2b5ce6' }}>🚛</div>
          <div className="ff-kpi-content">
            <div className="ff-kpi-label">Total Fleet</div>
            <div className="ff-kpi-number">{totalVehicles}</div>
            <div className="ff-kpi-note">Vehicles registered</div>
          </div>
        </div>

        <div className="ff-kpi-item" style={{ '--kpi-color': '#16a34a' }} onClick={() => navigate('/trips')}>
          <div className="ff-kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#16a34a' }}>📍</div>
          <div className="ff-kpi-content">
            <div className="ff-kpi-label">On Trip</div>
            <div className="ff-kpi-number">{onTrip}</div>
            <div className="ff-kpi-note">In transit now</div>
          </div>
        </div>

        <div className="ff-kpi-item" style={{ '--kpi-color': '#d97706' }} onClick={() => navigate('/maintenance')}>
          <div className="ff-kpi-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>🔧</div>
          <div className="ff-kpi-content">
            <div className="ff-kpi-label">Maintenance</div>
            <div className="ff-kpi-number">{maintenance}</div>
            <div className="ff-kpi-note">Under service</div>
          </div>
        </div>

        <div className="ff-kpi-item" style={{ '--kpi-color': '#7c3aed' }} onClick={() => navigate('/vehicles')}>
          <div className="ff-kpi-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>✅</div>
          <div className="ff-kpi-content">
            <div className="ff-kpi-label">Available</div>
            <div className="ff-kpi-number">{available}</div>
            <div className="ff-kpi-note">Ready to dispatch</div>
          </div>
        </div>
      </div>

      {/* DONUT + TOP VEHICLES */}
      <div className="ff-grid-row">
        <div className="ff-card">
          <div className="ff-card-header">
            <div className="ff-card-header-left">
              <div className="ff-card-icon" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>📊</div>
              <div>
                <h3 className="ff-card-title">Vehicle Status</h3>
                <div className="ff-card-subtitle">Distribution by current state</div>
              </div>
            </div>
          </div>

          <div className="ff-donut-wrap">
            <DonutChart
              segments={donutSegments}
              total={totalVehicles}
              hovered={hoveredSegment}
              setHovered={setHoveredSegment}
            />

            <div className="ff-donut-legend">
              {donutSegments.map(s => {
                const isActive = hoveredSegment === s.id;
                const pct = totalVehicles > 0 ? (s.value / totalVehicles) * 100 : 0;
                return (
                  <div
                    key={s.id}
                    className={`ff-legend-row ${isActive ? 'active' : ''}`}
                    style={{ borderLeftColor: s.color }}
                    onMouseEnter={() => setHoveredSegment(s.id)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    <span className="ff-legend-dot" style={{ background: s.color }} />
                    <span className="ff-legend-name">{s.label}</span>
                    <span className="ff-legend-value">{s.value}</span>
                    <span className="ff-legend-pct">({pct.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="ff-card-header">
            <div className="ff-card-header-left">
              <div className="ff-card-icon" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>🏆</div>
              <div>
                <h3 className="ff-card-title">Top Vehicles</h3>
                <div className="ff-card-subtitle">Ranked by trips completed</div>
              </div>
            </div>
            <span className="ff-card-badge">🚛 {totalVehicles} total</span>
          </div>

          {topVehicles.length === 0 ? (
            <div className="ff-empty">
              <div className="ff-empty-icon">🚛</div>
              <div className="ff-empty-title">No trip data</div>
              <div className="ff-empty-text">Complete trips to see ranking</div>
            </div>
          ) : (
            <div className="ff-ranking-list">
              {topVehicles.map(([plate, count], i) => {
                const vehicle = vehicles.find(v => v.licensePlate === plate);
                const cls = i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : '';
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                return (
                  <div
                    key={plate}
                    className={`ff-rank-row ${cls}`}
                    onClick={() => vehicle && navigate(`/vehicles/${vehicle.id}`)}
                  >
                    <div className="ff-rank-left">
                      <span className="ff-rank-medal">{medal}</span>
                      <div className="ff-rank-info">
                        <div className="ff-rank-name">{plate}</div>
                        <div className="ff-rank-sub">{vehicle?.model || 'Vehicle'}</div>
                      </div>
                    </div>
                    <div className="ff-rank-right">
                      <span className="ff-rank-value">{count} trips</span>
                      <span className={`ff-rank-tag ${i === 0 ? 'ff-tag-gold' : i === 1 ? 'ff-tag-blue' : 'ff-tag-gray'}`}>
                        {i === 0 ? 'TOP' : i === 1 ? 'HOT' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DRIVER PERFORMANCE */}
      <DriverPerformance trips={trips} drivers={drivers} />

      {/* FUEL ANALYTICS */}
      <div className="ff-card" style={{ marginBottom: 24 }}>
        <div className="ff-card-header">
          <div className="ff-card-header-left">
            <div className="ff-card-icon" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>⛽</div>
            <div>
              <h3 className="ff-card-title">Fuel & Efficiency Analytics</h3>
              <div className="ff-card-subtitle">
                {completedTrips.length > 0
                  ? `${completedTrips.length} completed trips analyzed`
                  : 'Complete trips to see analytics'}
              </div>
            </div>
          </div>
          <span className="ff-card-badge">📅 This month</span>
        </div>

        {completedTrips.length === 0 ? (
          <div className="ff-empty">
            <div className="ff-empty-icon">⛽</div>
            <div className="ff-empty-title">No trip data available</div>
            <div className="ff-empty-text">Complete a trip to see fuel consumption</div>
          </div>
        ) : (
          <div className="ff-fuel-grid">
            <div className="ff-fuel-metric" style={{ borderLeftColor: '#2b5ce6' }}>
              <div className="ff-fuel-metric-top">
                <div className="ff-fuel-metric-icon">📏</div>
                <div className="ff-fuel-metric-label">Total Distance</div>
              </div>
              <div className="ff-fuel-metric-value">
                {totalTripDistance.toFixed(0)}
                <span className="ff-fuel-metric-unit">km</span>
              </div>
              <div className="ff-fuel-metric-sub">From {completedTrips.length} trips</div>
            </div>

            <div className="ff-fuel-metric" style={{ borderLeftColor: '#f59e0b' }}>
              <div className="ff-fuel-metric-top">
                <div className="ff-fuel-metric-icon">⛽</div>
                <div className="ff-fuel-metric-label">Fuel Used</div>
              </div>
              <div className="ff-fuel-metric-value">
                {fuelUsed.toFixed(1)}
                <span className="ff-fuel-metric-unit">L</span>
              </div>
              <div className="ff-fuel-metric-sub">{avgFuel} L/100km avg</div>
            </div>

            <div className="ff-fuel-metric" style={{ borderLeftColor: '#16a34a' }}>
              <div className="ff-fuel-metric-top">
                <div className="ff-fuel-metric-icon">💰</div>
                <div className="ff-fuel-metric-label">Fuel Cost</div>
              </div>
              <div className="ff-fuel-metric-value">${fuelCost.toFixed(2)}</div>
              <div className="ff-fuel-metric-sub">$1.80 / L rate</div>
            </div>

            <div className="ff-fuel-metric" style={{ borderLeftColor: '#7c3aed' }}>
              <div className="ff-fuel-metric-top">
                <div className="ff-fuel-metric-icon">📋</div>
                <div className="ff-fuel-metric-label">Trips</div>
              </div>
              <div className="ff-fuel-metric-value">{trips.length}</div>
              <div className="ff-fuel-metric-sub">{completedTrips.length} completed</div>
            </div>
          </div>
        )}
      </div>

      {/* MAINTENANCE */}
      <div className="ff-card">
        <div className="ff-card-header">
          <div className="ff-card-header-left">
            <div className="ff-card-icon" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>🔔</div>
            <div>
              <h3 className="ff-card-title">Maintenance Reminders</h3>
              <div className="ff-card-subtitle">
                {dueSorted.length > 0
                  ? `${dueSorted.length} vehicle${dueSorted.length > 1 ? 's' : ''} need attention`
                  : 'All vehicles up to date'}
              </div>
            </div>
          </div>
          <span className="ff-card-badge">🔧 Every {serviceInterval.toLocaleString()} km</span>
        </div>

        {dueSorted.length === 0 ? (
          <div className="ff-maint-alert ok">
            <span className="ff-maint-icon">✅</span>
            <div className="ff-maint-info">
              <div className="ff-maint-name">All vehicles are up to date</div>
              <div className="ff-maint-sub">No maintenance reminders at this time</div>
            </div>
            <span className="ff-maint-status ok">OK</span>
          </div>
        ) : (
          dueSorted.map(v => (
            <div
              key={v.id}
              className={`ff-maint-alert ${v.isOverdue ? 'overdue' : 'due'}`}
              onClick={() => navigate('/maintenance', { state: { vehicleId: v.id } })}
            >
              <span className="ff-maint-icon">{v.isOverdue ? '🚨' : '⚠️'}</span>
              <div className="ff-maint-info">
                <div className="ff-maint-name">{v.licensePlate}</div>
                <div className="ff-maint-sub">
                  {v.model} • {v.currentMileage.toFixed(0)} km •{' '}
                  {v.isOverdue
                    ? `Overdue by ${(v.currentMileage - v.nextService).toFixed(0)} km`
                    : `${v.kmLeft.toFixed(0)} km left`}
                </div>
              </div>
              <span className={`ff-maint-status ${v.isOverdue ? 'overdue' : 'due'}`}>
                {v.isOverdue ? 'OVERDUE' : 'DUE SOON'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const DonutChart = ({ segments, total, hovered, setHovered }) => {
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  let cumulative = 0;

  return (
    <div className="ff-donut-svg-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5eaf1" strokeWidth={strokeWidth} />
        {segments.map(seg => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0;
          if (pct === 0) return null;

          const angle = (pct / 100) * 360;
          const startAngle = cumulative;
          const endAngle = cumulative + angle;
          cumulative = endAngle;

          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (endAngle - 90) * (Math.PI / 180);

          const x1 = size / 2 + radius * Math.cos(startRad);
          const y1 = size / 2 + radius * Math.sin(startRad);
          const x2 = size / 2 + radius * Math.cos(endRad);
          const y2 = size / 2 + radius * Math.sin(endRad);
          const largeArc = pct > 50 ? 1 : 0;

          const d = `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          const isHovered = hovered === seg.id;

          return (
            <path
              key={seg.id}
              d={d}
              fill={isHovered ? seg.hoverColor : seg.color}
              stroke="#fff"
              strokeWidth="3"
              style={{ transition: 'fill 0.25s ease', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(seg.id)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>
      <div className="ff-donut-center">
        <div className="ff-donut-value">{total}</div>
        <div className="ff-donut-label">TOTAL</div>
      </div>
    </div>
  );
};

export default Dashboard;