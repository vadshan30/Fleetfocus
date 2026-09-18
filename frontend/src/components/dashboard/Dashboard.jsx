import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchVehicles } from '../../store/slices/vehicleSlice';
import tripService from '../../services/tripService';
import driverService from '../../services/driverService';
import maintenanceService from '../../services/maintenanceService';
import DriverPerformance from './DriverPerformance';

// UI Components
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import Icon from '../ui/Icon';

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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user.username}!
            </h1>
            <p className="mt-2 text-blue-100 text-sm">
              Ready to start your next journey? View your assigned trips and log journey metrics in real-time.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/trips')}
                className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Icon name="Navigation" size={16} />
                <span>Go to Trip Log</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalVehicles = vehicles.length;
  const onTrip = vehicles.filter((v) => v.status === 'ON_TRIP').length;
  const maintenance = vehicles.filter((v) => v.status === 'UNDER_MAINTENANCE' || v.status === 'MAINTENANCE').length;
  const available = vehicles.filter((v) => v.status === 'AVAILABLE').length;

  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');
  const totalTripDistance = completedTrips.reduce((s, t) => s + (t.distanceCovered || 0), 0);
  const avgFuel = 8.5;
  const fuelUsed = (totalTripDistance / 100) * avgFuel;
  const fuelCost = fuelUsed * 1.8;

  const vehicleTripCounts = {};
  trips.forEach((t) => {
    const plate = t.vehicle?.licensePlate;
    if (plate) vehicleTripCounts[plate] = (vehicleTripCounts[plate] || 0) + 1;
  });
  const topVehicles = Object.entries(vehicleTripCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const serviceInterval = 5000;
  const vehiclesWithMaint = vehicles
    .map((v) => {
      const logs = maintenanceLogs.filter((l) => l.vehicle?.id === v.id);
      const tripDist = completedTrips
        .filter((t) => t.vehicle?.id === v.id)
        .reduce((s, t) => s + (t.distanceCovered || 0), 0);
      const currentMileage = (v.currentMileage || 0) + tripDist;
      const nextService =
        logs.length > 0
          ? Math.floor(currentMileage / serviceInterval + 1) * serviceInterval
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
    })
    .filter((v) => v.isOverdue || v.isDue);

  const dueSorted = [...vehiclesWithMaint].sort((a, b) => a.kmLeft - b.kmLeft);

  const donutSegments = [
    { id: 'onTrip', label: 'On Trip', value: onTrip, color: '#3b82f6', hoverColor: '#2563eb' },
    { id: 'maintenance', label: 'Maintenance', value: maintenance, color: '#f59e0b', hoverColor: '#d97706' },
    { id: 'available', label: 'Available', value: available, color: '#10b981', hoverColor: '#059669' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
              <Icon name="Activity" size={12} /> Enterprise Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Real-Time Fleet Operations
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-xl">
              Track live telemetry, dispatch vehicles, manage driver safety ratings, and maintain fleet health.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/live')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Icon name="Radio" size={16} />
              <span>Live Fleet</span>
            </button>
            <button
              onClick={() => navigate('/trips')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2"
            >
              <Icon name="Navigation" size={16} />
              <span>View Trips</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="cursor-pointer h-full" onClick={() => navigate('/vehicles')}>
          <StatCard
            className="h-full"
            icon="Truck"
            iconColor="blue"
            label="Total Fleet"
            value={totalVehicles}
            subtext="Registered active vehicles"
            progress={{ percent: 100, color: 'blue' }}
          />
        </div>
        <div className="cursor-pointer h-full" onClick={() => navigate('/trips')}>
          <StatCard
            className="h-full"
            icon="Navigation"
            iconColor="green"
            label="On Trip"
            value={onTrip}
            subtext="Currently en route"
            progress={{ percent: Math.round((onTrip / (totalVehicles || 1)) * 100), color: 'green' }}
          />
        </div>
        <div className="cursor-pointer h-full" onClick={() => navigate('/maintenance')}>
          <StatCard
            className="h-full"
            icon="Wrench"
            iconColor="amber"
            label="Maintenance"
            value={maintenance}
            subtext="Under inspection / service"
            progress={{ percent: Math.round((maintenance / (totalVehicles || 1)) * 100), color: 'amber' }}
          />
        </div>
        <div className="cursor-pointer h-full" onClick={() => navigate('/vehicles')}>
          <StatCard
            className="h-full"
            icon="CheckCircle2"
            iconColor="purple"
            label="Available"
            value={available}
            subtext="Ready for immediate dispatch"
            progress={{ percent: Math.round((available / (totalVehicles || 1)) * 100), color: 'purple' }}
          />
        </div>
      </div>

      {/* DONUT + TOP VEHICLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Icon name="PieChart" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Vehicle Status Distribution
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Current fleet availability split
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            <DonutChart
              segments={donutSegments}
              total={totalVehicles}
              hovered={hoveredSegment}
              setHovered={setHoveredSegment}
            />

            <div className="w-full sm:w-auto space-y-2.5">
              {donutSegments.map((s) => {
                const isActive = hoveredSegment === s.id;
                const pct = totalVehicles > 0 ? (s.value / totalVehicles) * 100 : 0;
                return (
                  <div
                    key={s.id}
                    onMouseEnter={() => setHoveredSegment(s.id)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className={`flex items-center justify-between gap-6 px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-50 dark:bg-slate-800 border-blue-500/40 shadow-sm'
                        : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {s.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{s.value}</span>
                      <span className="text-slate-400 text-[11px]">({pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Vehicles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Icon name="Award" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Top Performing Vehicles
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ranked by completed trip volume
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {totalVehicles} Total
            </span>
          </div>

          {topVehicles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No completed trips recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {topVehicles.map(([plate, count], i) => {
                const vehicle = vehicles.find((v) => v.licensePlate === plate);
                const medalIcon = i === 0 ? '🏆' : i === 1 ? '🥇' : i === 2 ? '🥈' : `#${i + 1}`;
                return (
                  <div
                    key={plate}
                    onClick={() => vehicle && navigate(`/vehicles/${vehicle.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-slate-400">
                        {medalIcon}
                      </span>
                      <div>
                        <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                          {plate}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {vehicle?.model || 'Fleet Vehicle'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {count} trips
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          i === 0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : i === 1
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
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

      {/* DRIVER PERFORMANCE COMPONENT */}
      <DriverPerformance trips={trips} drivers={drivers} />

      {/* FUEL & EFFICIENCY ANALYTICS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Icon name="Fuel" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                Fuel & Efficiency Analytics
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {completedTrips.length > 0
                  ? `${completedTrips.length} completed trips analyzed`
                  : 'Complete trips to generate fuel analytics'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            This Month
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Total Distance</span>
              <Icon name="MapPin" size={14} className="text-blue-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {totalTripDistance.toFixed(0)}{' '}
              <span className="text-xs font-normal text-slate-400">km</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">From {completedTrips.length} completed trips</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Estimated Fuel Used</span>
              <Icon name="Fuel" size={14} className="text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {fuelUsed.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">L</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{avgFuel} L/100km avg rate</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Est. Fuel Cost</span>
              <Icon name="DollarSign" size={14} className="text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-50">
              ${fuelCost.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">$1.80 / Liter avg</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Total Dispatches</span>
              <Icon name="Route" size={14} className="text-purple-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {trips.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{completedTrips.length} completed</div>
          </div>
        </div>
      </div>

      {/* MAINTENANCE ALERTS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Icon name="Bell" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                Maintenance Reminders & Service Alerts
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {dueSorted.length > 0
                  ? `${dueSorted.length} vehicle${dueSorted.length > 1 ? 's' : ''} require technical inspection`
                  : 'All fleet vehicles are within healthy service intervals'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Interval: {serviceInterval.toLocaleString()} km
          </span>
        </div>

        {dueSorted.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs">
            <Icon name="CheckCircle2" size={20} className="text-emerald-500 shrink-0" />
            <div>
              <div className="font-bold">All vehicles in healthy condition</div>
              <div className="text-[11px] opacity-80">No maintenance triggers or overdue service alerts.</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {dueSorted.map((v) => (
              <div
                key={v.id}
                onClick={() => navigate('/maintenance', { state: { vehicleId: v.id } })}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  v.isOverdue
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name={v.isOverdue ? 'AlertTriangle' : 'Clock'}
                    size={20}
                    className={v.isOverdue ? 'text-rose-500' : 'text-amber-500'}
                  />
                  <div>
                    <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                      {v.licensePlate} ({v.model})
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Current Mileage: {v.currentMileage.toFixed(0)} km •{' '}
                      {v.isOverdue
                        ? `Overdue by ${(v.currentMileage - v.nextService).toFixed(0)} km`
                        : `${v.kmLeft.toFixed(0)} km remaining`}
                    </div>
                  </div>
                </div>

                <StatusBadge
                  status={v.isOverdue ? 'FAIL' : 'PENDING'}
                  label={v.isOverdue ? 'OVERDUE' : 'DUE SOON'}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DonutChart = ({ segments, total, hovered, setHovered }) => {
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  let cumulative = 0;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          className="dark:stroke-slate-800"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg) => {
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
              stroke="#ffffff"
              className="dark:stroke-slate-900"
              strokeWidth="2.5"
              style={{ transition: 'fill 0.2s ease', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(seg.id)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-extrabold text-slate-900 dark:text-slate-50 leading-none">
          {total}
        </span>
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
          TOTAL
        </span>
      </div>
    </div>
  );
};

export default Dashboard;