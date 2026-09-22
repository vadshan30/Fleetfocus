import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import tripService from '../../services/tripService';
import alertService from '../../services/alertService';
import monitoringService from '../../services/monitoringService';
import websocketService from '../../services/websocketService';

// UI Components
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import Icon from '../ui/Icon';
import ErrorState from '../common/ErrorState';

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [tripEta, setTripEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDriverData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const myTripsResponse = await tripService.getMyTrips();
      const tripsList = Array.isArray(myTripsResponse)
        ? myTripsResponse
        : myTripsResponse?.content || [];
      setTrips(tripsList);

      // Determine current or most recent vehicle from trips
      const activeTrip = tripsList.find((t) => t.status === 'IN_PROGRESS');
      const latestTrip = activeTrip || tripsList[0];
      const assignedVehicle = latestTrip?.vehicle || null;
      setVehicle(assignedVehicle);

      if (activeTrip) {
        try {
          const eta = await tripService.getEta(activeTrip.id);
          setTripEta(eta);
        } catch (e) {
          console.warn('Could not load ETA for active trip:', e);
        }
      } else {
        setTripEta(null);
      }

      if (assignedVehicle) {
        // Fetch live telemetry safely
        try {
          const liveFleet = await monitoringService.getLiveFleet();
          const fleetList = Array.isArray(liveFleet) ? liveFleet : [];
          const liveData = fleetList.find(
            (v) =>
              v.vehicleId === assignedVehicle.id ||
              v.licensePlate === assignedVehicle.licensePlate
          );
          setTelemetry(liveData || null);
        } catch (e) {
          console.warn('Could not load telemetry for driver vehicle:', e);
          setTelemetry(null);
        }

        // Fetch alerts safely
        try {
          const alertsPage = await alertService.getAlerts(
            { vehicleId: assignedVehicle.id, resolved: false },
            0,
            5
          );
          const alertsList = Array.isArray(alertsPage)
            ? alertsPage
            : alertsPage?.content || [];
          setAlerts(alertsList);
        } catch (e) {
          console.warn('Could not load alerts for driver vehicle:', e);
          setAlerts([]);
        }
      } else {
        setTelemetry(null);
        setAlerts([]);
      }
    } catch (err) {
      console.error('Failed to load driver dashboard data:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load driver dashboard data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDriverData();

    const unsubscribeTrips = websocketService.subscribe('/topic/trips', (data) => {
      if (!data) return;
      loadDriverData();
    });

    return () => {
      unsubscribeTrips();
    };
  }, [loadDriverData, user?.username]);

  const activeTrip = trips.find((t) => t.status === 'IN_PROGRESS');
  const upcomingTrips = trips.filter((t) => t.status === 'SCHEDULED');
  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');

  const totalDistance = completedTrips.reduce((s, t) => s + (t.distanceCovered || 0), 0);

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await alertService.acknowledge(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
        <Icon name="RefreshCw" size={24} className="animate-spin text-blue-500" />
        <span>Loading driver portal...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto py-12">
        <ErrorState message={error} onRetry={loadDriverData} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* DRIVER HERO */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-600/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-3">
              <Icon name="User" size={12} /> Driver Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.username || 'Driver'}!
            </h1>
            <p className="mt-1 text-blue-100 text-xs sm:text-sm max-w-xl">
              {activeTrip
                ? `You have an active trip in progress with vehicle ${activeTrip.vehicle?.licensePlate || ''}. Safe driving!`
                : 'You are currently off route. Review your assigned vehicle and upcoming trips below.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {user?.role === 'DRIVER' && (
              <button
                onClick={() => navigate('/driver-app')}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Icon name="Smartphone" size={16} />
                <span>Switch to Driver App</span>
              </button>
            )}
            <button
              onClick={() => navigate('/my-trips')}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Icon name="Navigation" size={16} />
              <span>My Trips</span>
            </button>
            <button
              onClick={() => navigate('/my-vehicle')}
              className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs border border-blue-500/40 transition-all flex items-center gap-2"
            >
              <Icon name="Truck" size={16} />
              <span>My Vehicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="Navigation"
          iconColor="blue"
          label="Trip Status"
          value={activeTrip ? 'In Progress' : 'Standby'}
          subtext={activeTrip ? `Trip #${activeTrip.id}` : 'Ready for dispatch'}
        />
        <StatCard
          icon="Calendar"
          iconColor="purple"
          label="Upcoming Trips"
          value={upcomingTrips.length}
          subtext="Assigned scheduled journeys"
        />
        <StatCard
          icon="MapPin"
          iconColor="green"
          label="Distance Driven"
          value={`${totalDistance.toFixed(0)} km`}
          subtext={`Across ${completedTrips.length} completed trips`}
        />
        <StatCard
          icon="Bell"
          iconColor="amber"
          label="Vehicle Alerts"
          value={alerts.length}
          subtext="Active issues on assigned vehicle"
        />
      </div>

      {/* MAIN CONTENT: CURRENT TRIP & MY VEHICLE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CURRENT TRIP CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Icon name="Navigation" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Current Assigned Trip
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Active journey routing & dispatch status
                </p>
              </div>
            </div>
            {activeTrip && <StatusBadge status={activeTrip.status} pulse />}
          </div>

          {activeTrip ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Trip Identifier:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">#{activeTrip.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Vehicle:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {activeTrip.vehicle?.licensePlate} ({activeTrip.vehicle?.model})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Started At:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {activeTrip.actualStartTime ? new Date(activeTrip.actualStartTime).toLocaleString() : (activeTrip.startTime ? new Date(activeTrip.startTime).toLocaleString() : 'N/A')}
                  </span>
                </div>
                {activeTrip.distanceCovered > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Distance Logged:</span>
                    <span className="font-bold text-emerald-600">{activeTrip.distanceCovered.toFixed(1)} km</span>
                  </div>
                )}
              </div>

              {/* LIVE ETA & DESTINATION TRACKING */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Icon name="Clock" size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Live Arrival Estimate</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {tripEta?.estimatedArrivalTime ? (
                          (() => {
                            const date = new Date(tripEta.estimatedArrivalTime);
                            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const diffMin = Math.max(0, Math.round((date.getTime() - Date.now()) / 60000));
                            return `Your ETA: ${timeStr} (~${diffMin} min)`;
                          })()
                        ) : activeTrip.estimatedArrivalTime ? (
                          (() => {
                            const date = new Date(activeTrip.estimatedArrivalTime);
                            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const diffMin = Math.max(0, Math.round((date.getTime() - Date.now()) / 60000));
                            return `Your ETA: ${timeStr} (~${diffMin} min)`;
                          })()
                        ) : (
                          'Calculating ETA live...'
                        )}
                      </div>
                    </div>
                  </div>

                  {tripEta?.remainingKm != null && (
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Remaining</div>
                      <div className="font-bold text-xs text-blue-600 dark:text-blue-400">
                        You are {tripEta.remainingKm.toFixed(1)} km from destination
                      </div>
                    </div>
                  )}
                </div>

                {/* Delay Warning */}
                {((tripEta?.delayMinutes != null && tripEta.delayMinutes > 0) ||
                  (activeTrip.delayMinutes != null && activeTrip.delayMinutes > 0)) && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 animate-pulse">
                    <Icon name="AlertTriangle" size={15} className="text-amber-600 shrink-0" />
                    <span>
                      <strong>Warning:</strong> Trip delayed by ~{tripEta?.delayMinutes || activeTrip.delayMinutes} min past scheduled arrival time.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/my-trips')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>View Trip Details</span>
                  <Icon name="ArrowRight" size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Icon name="CheckCircle2" size={32} className="mx-auto text-emerald-500 opacity-80" />
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No trips assigned
              </div>
              <div className="text-[11px] text-slate-400">
                You are currently on standby. Any new dispatches assigned to you will appear here.
              </div>
            </div>
          )}
        </div>

        {/* MY VEHICLE CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Icon name="Truck" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Assigned Vehicle
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Current vehicle specs and operational metrics
                </p>
              </div>
            </div>
            {vehicle && <StatusBadge status={vehicle.status} />}
          </div>

          {vehicle ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100">
                      {vehicle.licensePlate}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{vehicle.model}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Mileage</div>
                    <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                      {(vehicle.currentMileage || 0).toLocaleString()} km
                    </div>
                  </div>
                </div>

                {/* Telemetry preview if available */}
                {telemetry && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Icon name="Gauge" size={11} /> Speed
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {telemetry.speed?.toFixed(1) || 0} km/h
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Icon name="Fuel" size={11} /> Fuel
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {telemetry.fuelLevel?.toFixed(0) || 0}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Icon name="Thermometer" size={11} /> Temp
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {telemetry.engineTemp?.toFixed(0) || 85}°C
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/my-vehicle')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Vehicle Telemetry</span>
                  <Icon name="ExternalLink" size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No vehicle assigned. Contact your dispatcher to be assigned a vehicle.
            </div>
          )}
        </div>
      </div>

      {/* UPCOMING TRIPS & MY ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UPCOMING TRIPS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Icon name="Calendar" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Upcoming Dispatches
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scheduled trips assigned to your profile
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/my-trips')}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View All
            </button>
          </div>

          {upcomingTrips.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No upcoming scheduled trips.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                      Trip #{trip.id} · {trip.vehicle?.licensePlate || 'Vehicle'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Departure: {trip.startTime ? new Date(trip.startTime).toLocaleString() : 'TBD'}
                    </div>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY ALERTS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Icon name="Bell" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  My Vehicle Alerts
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Active alerts associated with your vehicle
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {alerts.length} Active
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="py-8 text-center text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-2">
              <Icon name="CheckCircle2" size={16} />
              <span>No active alerts on your assigned vehicle</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {alert.alertType || alert.type || 'Alert'}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                        {alert.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {alert.message || `Triggered at ${alert.occurredAt ? new Date(alert.occurredAt).toLocaleTimeString() : 'now'}`}
                    </div>
                  </div>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold transition-colors shrink-0"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
