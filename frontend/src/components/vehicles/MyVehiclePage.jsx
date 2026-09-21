import React, { useState, useEffect, useCallback } from 'react';
import tripService from '../../services/tripService';
import monitoringService from '../../services/monitoringService';
import StatusBadge from '../ui/StatusBadge';
import Icon from '../ui/Icon';
import ErrorState from '../common/ErrorState';

const MyVehiclePage = () => {
  const [vehicle, setVehicle] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchVehicleAndTelemetry = useCallback(async () => {
    setError(null);
    try {
      const myTrips = await tripService.getMyTrips();
      const tripsList = Array.isArray(myTrips) ? myTrips : myTrips?.content || [];
      const activeTrip = tripsList.find((t) => t.status === 'IN_PROGRESS');
      const latestTrip = activeTrip || tripsList[0];
      const assigned = latestTrip?.vehicle || null;
      setVehicle(assigned);

      if (assigned) {
        try {
          const liveFleet = await monitoringService.getLiveFleet();
          const fleetList = Array.isArray(liveFleet) ? liveFleet : [];
          const liveData = fleetList.find(
            (v) => v.vehicleId === assigned.id || v.licensePlate === assigned.licensePlate
          );
          setTelemetry(liveData || null);
        } catch (e) {
          console.warn('Failed to fetch live fleet telemetry:', e);
        }
      } else {
        setTelemetry(null);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch vehicle information:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load assigned vehicle details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicleAndTelemetry();
    const interval = setInterval(fetchVehicleAndTelemetry, 10000);
    return () => clearInterval(interval);
  }, [fetchVehicleAndTelemetry]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
        <Icon name="RefreshCw" size={24} className="animate-spin text-blue-500" />
        <span>Loading vehicle specifications and telemetry...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto py-12">
        <ErrorState message={error} onRetry={fetchVehicleAndTelemetry} />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-6 max-w-4xl mx-auto py-16">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Icon name="Truck" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            No Vehicle Currently Assigned
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You do not have a vehicle actively assigned for dispatch. Once your dispatcher assigns you to a route, telemetry and operational details will stream here.
          </p>
        </div>
      </div>
    );
  }

  const speed = telemetry?.speed || 0;
  const isSpeeding = speed > 90;
  const fuel = Math.min(100, Math.max(0, telemetry?.fuelLevel ?? 80));
  const engineTemp = telemetry?.engineTemp ?? 88;
  const isHot = engineTemp > 100;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono">
              {vehicle.licensePlate}
            </h1>
            <StatusBadge status={vehicle.status} pulse={vehicle.status === 'ON_TRIP'} />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Icon name="Truck" size={12} /> MY VEHICLE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {vehicle.model} · VIN: {vehicle.vin || 'N/A'} · Live Telemetry Stream
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-sm self-start sm:self-auto">
          <Icon name="RefreshCw" size={13} className="text-blue-500 animate-spin" />
          <span>Stream updated: {lastRefreshed.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* TELEMETRY GAUGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SPEED */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Current Speed</span>
            <Icon name="Gauge" size={16} className={isSpeeding ? 'text-rose-500' : 'text-blue-500'} />
          </div>
          <div className="flex items-baseline gap-2">
            <div className={`text-3xl font-extrabold tracking-tight ${isSpeeding ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-50'}`}>
              {speed.toFixed(1)}
            </div>
            <span className="text-xs text-slate-400 font-medium">km/h</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isSpeeding ? (
              <span className="text-rose-500 font-semibold flex items-center gap-1">
                <Icon name="AlertTriangle" size={12} /> Exceeding speed limit
              </span>
            ) : (
              'Normal driving speed'
            )}
          </div>
        </div>

        {/* FUEL LEVEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Fuel Level</span>
            <Icon name="Fuel" size={16} className={fuel < 20 ? 'text-rose-500' : 'text-emerald-500'} />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {fuel.toFixed(0)}%
            </div>
            <span className="text-xs text-slate-400 font-medium">remaining</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fuel >= 50 ? 'bg-emerald-500' : fuel >= 20 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${fuel}%` }}
            />
          </div>
        </div>

        {/* ENGINE TEMP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Engine Temperature</span>
            <Icon name="Thermometer" size={16} className={isHot ? 'text-rose-500' : 'text-amber-500'} />
          </div>
          <div className="flex items-baseline gap-2">
            <div className={`text-3xl font-extrabold tracking-tight ${isHot ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-50'}`}>
              {engineTemp.toFixed(0)}°C
            </div>
            <span className="text-xs text-slate-400 font-medium">coolant</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isHot ? (
              <span className="text-rose-500 font-semibold flex items-center gap-1">
                <Icon name="AlertTriangle" size={12} /> High temperature alert
              </span>
            ) : (
              'Optimal operating temperature'
            )}
          </div>
        </div>

        {/* MILEAGE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Odometer Reading</span>
            <Icon name="MapPin" size={16} className="text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-mono">
              {(vehicle.currentMileage || 0).toLocaleString()}
            </div>
            <span className="text-xs text-slate-400 font-medium">km</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Total distance on vehicle chassis
          </div>
        </div>
      </div>

      {/* DETAILED SPECIFICATIONS CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon name="FileText" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              Vehicle Registration & Specifications
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Technical records stored in fleet registry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              License Plate
            </div>
            <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
              {vehicle.licensePlate}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Model & Make
            </div>
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {vehicle.model || 'Standard Fleet Truck'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              VIN (Vehicle Identification)
            </div>
            <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
              {vehicle.vin || 'Not Registered'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Operational Status
            </div>
            <div>
              <StatusBadge status={vehicle.status} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Next Service Target
            </div>
            <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
              {(Math.floor((vehicle.currentMileage || 0) / 5000 + 1) * 5000).toLocaleString()} km
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Chassis Identifier
            </div>
            <div className="font-mono text-sm text-slate-500 dark:text-slate-400">
              FLEET-VEH-{vehicle.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyVehiclePage;
