import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import tripService from '../../services/tripService';
import driverService from '../../services/driverService';
import monitoringService from '../../services/monitoringService';

// UI Components
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import Icon from '../ui/Icon';
import ErrorState from '../common/ErrorState';

// Mini Map
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const createMiniMarkerIcon = (status) => {
  const color = status === 'ON_TRIP' ? '#3b82f6' : status === 'AVAILABLE' ? '#10b981' : '#f59e0b';
  return L.divIcon({
    className: 'mini-marker',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

const DispatcherDashboard = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDispatcherData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tripsData, driversData, fleetData] = await Promise.all([
        tripService.getAll().catch(() => []),
        driverService.getAll().catch(() => []),
        monitoringService.getLiveFleet().catch(() => []),
      ]);
      setTrips(Array.isArray(tripsData) ? tripsData : tripsData?.content || []);
      setDrivers(Array.isArray(driversData) ? driversData : driversData?.content || []);
      setFleet(Array.isArray(fleetData) ? fleetData : []);
    } catch (err) {
      console.error('Failed to fetch dispatcher data:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load dispatch operations data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDispatcherData();

    const interval = setInterval(() => {
      monitoringService.getLiveFleet().then((data) => setFleet(Array.isArray(data) ? data : [])).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchDispatcherData]);

  const activeTrips = trips.filter((t) => t.status === 'IN_PROGRESS');
  const scheduledTrips = trips.filter((t) => t.status === 'SCHEDULED');
  const availableDrivers = drivers.filter((d) => d.status === 'AVAILABLE');
  const onTripVehicles = fleet.filter((v) => v.status === 'ON_TRIP');

  const validMapVehicles = fleet.filter((v) => typeof v.lat === 'number' && typeof v.lng === 'number');
  const mapCenter = validMapVehicles.length > 0
    ? [
        validMapVehicles.reduce((s, v) => s + v.lat, 0) / validMapVehicles.length,
        validMapVehicles.reduce((s, v) => s + v.lng, 0) / validMapVehicles.length,
      ]
    : [39.8283, -98.5795];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
        <Icon name="RefreshCw" size={24} className="animate-spin text-blue-500" />
        <span>Loading dispatch operations desk...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto py-12">
        <ErrorState message={error} onRetry={fetchDispatcherData} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
              <Icon name="Compass" size={12} /> Dispatch Operations Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Active Dispatch Control
            </h1>
            <p className="mt-1 text-blue-200 text-xs sm:text-sm max-w-xl">
              Monitor active dispatches, assign available drivers, and supervise live vehicle routes.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/trips')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Icon name="PlusCircle" size={16} />
              <span>Dispatch Trip</span>
            </button>
            <button
              onClick={() => navigate('/live-fleet')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2"
            >
              <Icon name="Radio" size={16} />
              <span>Full Live Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="cursor-pointer h-full" onClick={() => navigate('/trips')}>
          <StatCard
            className="h-full"
            icon="Navigation"
            iconColor="blue"
            label="Active Trips"
            value={activeTrips.length}
            subtext="Vehicles currently en route"
            progress={{ percent: Math.round((activeTrips.length / (trips.length || 1)) * 100), color: 'blue' }}
          />
        </div>
        <div className="cursor-pointer h-full" onClick={() => navigate('/trips')}>
          <StatCard
            className="h-full"
            icon="Calendar"
            iconColor="purple"
            label="Scheduled Trips"
            value={scheduledTrips.length}
            subtext="Upcoming departures booked"
            progress={{ percent: Math.round((scheduledTrips.length / (trips.length || 1)) * 100), color: 'purple' }}
          />
        </div>
        <div className="cursor-pointer h-full" onClick={() => navigate('/drivers')}>
          <StatCard
            className="h-full"
            icon="Users"
            iconColor="green"
            label="Available Drivers"
            value={availableDrivers.length}
            subtext={`Out of ${drivers.length} total drivers`}
            progress={{ percent: Math.round((availableDrivers.length / (drivers.length || 1)) * 100), color: 'green' }}
          />
        </div>
        <div className="cursor-pointer h-full" onClick={() => navigate('/live-fleet')}>
          <StatCard
            className="h-full"
            icon="Radio"
            iconColor="amber"
            label="Vehicles on Road"
            value={onTripVehicles.length}
            subtext="Active telemetry streams"
            progress={{ percent: Math.round((onTripVehicles.length / (fleet.length || 1)) * 100), color: 'amber' }}
          />
        </div>
      </div>

      {/* MINI MAP & ACTIVE TRIPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LIVE FLEET MINI-MAP (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Icon name="MapPin" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Live Fleet Radar
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time positional stream of deployed vehicles
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/live-fleet')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Expand Map</span>
              <Icon name="ExternalLink" size={12} />
            </button>
          </div>

          <div className="h-[340px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-0">
            <MapContainer
              center={mapCenter}
              zoom={validMapVehicles.length <= 1 ? 8 : 4}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              {validMapVehicles.map((v) => (
                <Marker
                  key={v.vehicleId || v.id || v.licensePlate}
                  position={[v.lat, v.lng]}
                  icon={createMiniMarkerIcon(v.status)}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <div className="font-bold text-slate-900">{v.licensePlate}</div>
                      <div className="text-slate-500">{v.model}</div>
                      <div className="text-slate-600 mt-1">Status: <strong>{v.status}</strong></div>
                      {typeof v.speed === 'number' && (
                        <div>Speed: {v.speed.toFixed(1)} km/h</div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> On Trip ({onTripVehicles.length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available ({fleet.filter((v) => v.status === 'AVAILABLE').length})
              </span>
            </div>
            <span>{fleet.length} total monitored</span>
          </div>
        </div>

        {/* TOP DRIVERS & AVAILABILITY (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Icon name="Users" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Driver Roster
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ready for immediate assignment
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/drivers')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <Icon name="ChevronRight" size={12} />
            </button>
          </div>

          {drivers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No drivers found in the system.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {drivers.slice(0, 6).map((driver) => {
                const isAvail = driver.status === 'AVAILABLE';
                return (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        {driver.user?.username?.charAt(0).toUpperCase() || 'D'}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {driver.user?.username || 'Driver'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          License: {driver.licenseNumber || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={driver.status} />
                      {isAvail && (
                        <button
                          onClick={() => navigate('/trips', { state: { assignDriverId: driver.id } })}
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold rounded text-[11px] transition-all"
                        >
                          Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TRIPS LIST PREVIEW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Icon name="Navigation" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                Recent & Active Trip Log
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Showing latest dispatches across the fleet
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/trips')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Trips</span>
            <Icon name="ChevronRight" size={12} />
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No trips dispatched yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Trip ID</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Departure Time</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {trips.slice(0, 8).map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                      #{trip.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {trip.vehicle?.licensePlate || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400">{trip.vehicle?.model}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {trip.driver?.user?.username || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                      {trip.startTime ? new Date(trip.startTime).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {trip.distanceCovered ? `${trip.distanceCovered.toFixed(1)} km` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={trip.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatcherDashboard;
