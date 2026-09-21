import React, { useMemo } from 'react';
import Icon from '../ui/Icon';

const getStatusColor = (status, isDark) => {
  switch (status) {
    case 'AVAILABLE':
      return isDark ? 'text-emerald-400' : 'text-emerald-600';
    case 'ON_TRIP':
      return isDark ? 'text-blue-400' : 'text-blue-600';
    case 'MAINTENANCE':
    case 'UNDER_MAINTENANCE':
      return isDark ? 'text-amber-400' : 'text-amber-600';
    default:
      return isDark ? 'text-slate-400' : 'text-slate-600';
  }
};

const getStatusBg = (status, isDark) => {
  switch (status) {
    case 'AVAILABLE':
      return isDark ? 'bg-emerald-950/50' : 'bg-emerald-50';
    case 'ON_TRIP':
      return isDark ? 'bg-blue-950/50' : 'bg-blue-50';
    case 'MAINTENANCE':
    case 'UNDER_MAINTENANCE':
      return isDark ? 'bg-amber-950/50' : 'bg-amber-50';
    default:
      return isDark ? 'bg-slate-800/50' : 'bg-slate-50';
  }
};

const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined) return 'N/A';
  return Number(num).toFixed(decimals);
};

const formatTimestamp = (rawTime) => {
  if (!rawTime) return '—';
  try {
    const cleaned = typeof rawTime === 'string' && rawTime.includes('.')
      ? rawTime.replace(/\.(\d{3})\d*/, '.$1')
      : rawTime;
    const d = new Date(cleaned);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '—';
  }
};

const VehicleRow = ({ vehicle, isDark }) => {
  const statusColor = getStatusColor(vehicle.status, isDark);
  const statusBg = getStatusBg(vehicle.status, isDark);

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${statusBg} border ${
        isDark ? 'border-slate-700' : 'border-slate-200'
      }`}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor:
            vehicle.status === 'AVAILABLE'
              ? '#10b981'
              : vehicle.status === 'ON_TRIP'
              ? '#3b82f6'
              : '#f59e0b',
          boxShadow: '0 0 8px currentColor',
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
            {vehicle.licensePlate}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor} ${statusBg}`}
          >
            {vehicle.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Icon name="Gauge" size={12} />
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              {formatNumber(vehicle.speed)} km/h
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="Fuel" size={12} />
            <span
              className={`font-mono font-medium ${
                vehicle.fuelLevel < 15
                  ? 'text-rose-600 dark:text-rose-400'
                  : vehicle.fuelLevel < 40
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatNumber(vehicle.fuelLevel, 0)}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="Thermometer" size={12} />
            <span
              className={`font-mono font-medium ${
                vehicle.engineTemp > 100
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {formatNumber(vehicle.engineTemp)}°C
            </span>
          </div>
        </div>
      </div>
      <div className="text-right text-xs text-slate-400 dark:text-slate-500 font-mono">
        {formatTimestamp(vehicle.timestamp || vehicle.recordedAt)}
      </div>
    </div>
  );
};

const LiveTelemetryPanel = ({ vehicles, isDark, isWaiting }) => {
  const sortedVehicles = useMemo(
    () =>
      [...vehicles].sort((a, b) => {
        const statusOrder = { ON_TRIP: 0, AVAILABLE: 1, MAINTENANCE: 2, UNDER_MAINTENANCE: 2 };
        return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
      }),
    [vehicles]
  );

  if (sortedVehicles.length === 0) {
    if (isWaiting) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 p-6">
          <Icon name="RefreshCw" size={32} className="mb-3 animate-spin text-blue-500" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Waiting for telemetry...
          </p>
          <p className="text-xs text-slate-400 mt-1">Connecting to live vehicle stream</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 p-6">
        <Icon name="Truck" size={48} className="mb-3 opacity-50" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No vehicles in fleet</p>
        <p className="text-xs text-slate-400 mt-1">Add vehicles to see live telemetry</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
          Live Telemetry
        </h3>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          {sortedVehicles.length} Active
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {sortedVehicles.map((vehicle) => (
          <VehicleRow key={vehicle.vehicleId || vehicle.id} vehicle={vehicle} isDark={isDark} />
        ))}
      </div>
    </div>
  );
};

export default LiveTelemetryPanel;