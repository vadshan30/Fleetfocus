import React, { useState, useEffect, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import websocketService from '../../services/websocketService';
import geofenceService from '../../services/geofenceService';
import monitoringService from '../../services/monitoringService';
import LiveFleetMap from './LiveFleetMap';
import LiveTelemetryPanel from './LiveTelemetryPanel';
import AlertFeed from './AlertFeed';
import GeofenceList from '../geofence/GeofenceList';
import GeofenceDrawer from '../geofence/GeofenceDrawer';
import Icon from '../ui/Icon';

const LiveFleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [isDark, setIsDark] = useState(false);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showGeofenceList, setShowGeofenceList] = useState(true);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [pendingGeofenceData, setPendingGeofenceData] = useState(null);
  const [editingGeofence, setEditingGeofence] = useState(null);
  const [waitingForTelemetry, setWaitingForTelemetry] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handler = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 1. Initial REST fetch for geofences
  const fetchGeofences = useCallback(async () => {
    try {
      const data = await geofenceService.getActive();
      setGeofences(data || []);
    } catch (err) {
      console.error('Failed to fetch geofences:', err);
    }
  }, []);

  useEffect(() => {
    fetchGeofences();
  }, [fetchGeofences]);

  // 2. Initial REST fetch for live fleet vehicles on mount
  const fetchInitialFleet = useCallback(async () => {
    try {
      const data = await monitoringService.getLiveFleet();
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((v) => ({
          ...v,
          vehicleId: String(v.vehicleId || v.id),
          licensePlate: v.licensePlate || 'N/A',
          model: v.model || '',
          status: v.status || 'AVAILABLE',
          lat: typeof v.lat === 'number' ? v.lat : (typeof v.latitude === 'number' ? v.latitude : null),
          lng: typeof v.lng === 'number' ? v.lng : (typeof v.longitude === 'number' ? v.longitude : null),
          speed: typeof v.speed === 'number' ? v.speed : 0,
          fuelLevel: typeof v.fuelLevel === 'number' ? v.fuelLevel : 0,
          engineTemp: typeof v.engineTemp === 'number' ? v.engineTemp : 85,
        }));
        setVehicles(normalized);
        setWaitingForTelemetry(false);
      }
    } catch (err) {
      console.error('[LiveFleetPage] Failed to fetch initial fleet status:', err);
    }
  }, []);

  useEffect(() => {
    fetchInitialFleet();
    const timer = setTimeout(() => {
      setWaitingForTelemetry(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [fetchInitialFleet]);

  // 3. WebSocket subscriptions for live telemetry & alerts
  useEffect(() => {
    const unsubscribeStatus = websocketService.onStatusChange(setWsStatus);

    const unsubscribeTelemetry = websocketService.subscribe('/topic/telemetry', (data) => {
      setWaitingForTelemetry(false);
      if (!data) return;

      const normData = {
        ...data,
        vehicleId: String(data.vehicleId || data.id),
        lat: typeof data.lat === 'number' ? data.lat : (typeof data.latitude === 'number' ? data.latitude : null),
        lng: typeof data.lng === 'number' ? data.lng : (typeof data.longitude === 'number' ? data.longitude : null),
      };

      setVehicles((prev) => {
        const exists = prev.find((v) => String(v.vehicleId || v.id) === normData.vehicleId);
        if (exists) {
          return prev.map((v) =>
            String(v.vehicleId || v.id) === normData.vehicleId ? { ...v, ...normData } : v
          );
        }
        return [...prev, normData];
      });
    });

    const unsubscribeAlerts = websocketService.subscribe('/topic/alerts', (data) => {
      if (!data) return;
      const alertWithId = {
        ...data,
        id: `${data.vehicleId}-${data.type}-${Date.now()}`,
      };
      setAlerts((prev) => [alertWithId, ...prev].slice(0, 50));
    });

    const unsubscribeTrips = websocketService.subscribe('/topic/trips', (data) => {
      if (!data) return;
      if (data.type === 'TRIP_STARTED') {
        if (window.addNotification) {
          window.addNotification(
            `Trip #${data.tripId} automatically started for vehicle ${data.licensePlate || data.vehicleId}`,
            'info'
          );
        }
        if (data.vehicleId) {
          setVehicles((prev) =>
            prev.map((v) =>
              String(v.vehicleId || v.id) === String(data.vehicleId)
                ? { ...v, status: 'ON_TRIP' }
                : v
            )
          );
        }
      } else if (data.type === 'TRIP_COMPLETED') {
        if (window.addNotification) {
          window.addNotification(
            `Trip #${data.tripId} reached destination and auto-completed!`,
            'success'
          );
        }
        if (data.vehicleId) {
          setVehicles((prev) =>
            prev.map((v) =>
              String(v.vehicleId || v.id) === String(data.vehicleId)
                ? { ...v, status: 'AVAILABLE' }
                : v
            )
          );
        }
      } else if (data.type === 'TRIP_DELAYED') {
        if (window.addNotification) {
          window.addNotification(
            `Trip #${data.tripId} delayed by ~${data.delayMinutes} min`,
            'warning'
          );
        }
      }
    });

    websocketService.connect().catch((err) => {
      console.error('[LiveFleetPage] WebSocket connection failed:', err);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeTelemetry();
      unsubscribeAlerts();
      unsubscribeTrips();
    };
  }, []);

  const handleAcknowledge = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleResolve = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleGeofenceSelect = useCallback((geofence) => {
    setSelectedGeofenceId(geofence.id);
  }, []);

  const handleSelectVehicle = useCallback((vehicleId) => {
    setSelectedVehicleId((prev) =>
      vehicleId && String(prev) === String(vehicleId) ? null : (vehicleId ? String(vehicleId) : null)
    );
  }, []);

  const handleAddGeofence = useCallback(() => {
    setEditingGeofence(null);
    setPendingGeofenceData({
      name: '',
      description: '',
      type: 'DEPOT',
      color: '#3b82f6',
      radiusMeters: 500,
      centerLat: null,
      centerLng: null,
      active: true,
    });
    setIsDrawerOpen(true);
  }, []);

  const handleEditGeofence = useCallback((geofence) => {
    setEditingGeofence(geofence);
    setPendingGeofenceData({
      name: geofence.name,
      description: geofence.description,
      type: geofence.type,
      color: geofence.color || '#3b82f6',
      radiusMeters: geofence.radiusMeters,
      centerLat: geofence.centerLat,
      centerLng: geofence.centerLng,
      active: geofence.active,
    });
    setIsDrawerOpen(true);
  }, []);

  const handlePickFromMap = useCallback(() => {
    setPickMode(true);
  }, []);

  const handlePickCoordinates = useCallback((lat, lng) => {
    setPendingGeofenceData((prev) =>
      prev ? { ...prev, centerLat: lat, centerLng: lng } : null
    );
    setPickMode(false);
  }, []);

  const handleSaveGeofence = useCallback(async (formData) => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        color: formData.color,
        radiusMeters: parseFloat(formData.radiusMeters),
        centerLat: parseFloat(formData.centerLat),
        centerLng: parseFloat(formData.centerLng),
        active: formData.active,
      };

      if (editingGeofence?.id) {
        await geofenceService.update(editingGeofence.id, payload);
      } else {
        await geofenceService.create(payload);
      }

      fetchGeofences();
    } catch (err) {
      console.error('Failed to save geofence:', err);
      throw err;
    } finally {
      setIsDrawerOpen(false);
      setPickMode(false);
      setPendingGeofenceData(null);
      setEditingGeofence(null);
    }
  }, [editingGeofence, fetchGeofences]);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setPickMode(false);
    setPendingGeofenceData(null);
    setEditingGeofence(null);
  }, []);

  const statusConfig = {
    connected: { label: 'Connected', color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    connecting: { label: 'Connecting…', color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/50' },
    disconnected: { label: 'Disconnected', color: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/50' },
  };

  const currentStatus = statusConfig[wsStatus] || statusConfig.disconnected;

  const toggleGeofenceList = () => setShowGeofenceList(!showGeofenceList);
  const toggleGeofences = () => setShowGeofences(!showGeofences);

  // Layout grid ratio:
  // - Sidebar shown: 2 + 6 + 4 = 12 columns
  // - Sidebar hidden: 0 + 8 + 4 = 12 columns
  const mapColClass = showGeofenceList ? 'lg:col-span-6' : 'lg:col-span-8';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* HEADER */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Live Fleet Operations
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-time vehicle tracking, telemetry streaming, and threshold alerts
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                LIVE
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.color.replace('bg-', 'border-')}`}>
                <span className={`relative flex h-1.5 w-1.5 rounded-full ${currentStatus.color}`} />
                {currentStatus.label}
              </span>
              <button
                onClick={toggleGeofenceList}
                className={`p-2 rounded-lg border transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${showGeofenceList ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' : 'border-slate-200 dark:border-slate-700'}`}
                title={showGeofenceList ? 'Hide geofence list' : 'Show geofence list'}
              >
                <Icon name="Layers" size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
          {/* GEOFENCE LIST SIDEBAR - 2/12 cols when visible */}
          {showGeofenceList && (
            <div className="lg:col-span-2 h-full hidden lg:block">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm h-full overflow-hidden">
                <GeofenceList
                  onSelectGeofence={handleGeofenceSelect}
                  onEditGeofence={handleEditGeofence}
                  isDark={isDark}
                />
              </div>
            </div>
          )}

          {/* MAP - 6/12 cols with sidebar, 8/12 cols without sidebar */}
          <div className={`${mapColClass} h-full transition-all duration-300`}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm h-full overflow-hidden">
              <LiveFleetMap
                vehicles={vehicles}
                geofences={geofences}
                isDark={isDark}
                showGeofences={showGeofences}
                onToggleGeofences={toggleGeofences}
                onAddGeofence={handleAddGeofence}
                onSelectGeofence={handleGeofenceSelect}
                selectedGeofenceId={selectedGeofenceId}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={handleSelectVehicle}
                pickMode={pickMode}
                onPickCoordinates={handlePickCoordinates}
              />
            </div>
          </div>

          {/* TELEMETRY PANEL - 4/12 cols */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm h-full overflow-hidden">
              <LiveTelemetryPanel
                vehicles={vehicles}
                isDark={isDark}
                isWaiting={waitingForTelemetry && vehicles.length === 0}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={handleSelectVehicle}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ALERT FEED OVERLAY */}
      <AlertFeed
        alerts={alerts}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
        isDark={isDark}
      />

      {/* GEOFENCE DRAWER */}
      <GeofenceDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onSave={handleSaveGeofence}
        onPickFromMap={handlePickFromMap}
        initialData={editingGeofence || pendingGeofenceData}
        isDark={isDark}
      />
    </div>
  );
};

export default LiveFleetPage;