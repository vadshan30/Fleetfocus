import React, { useState, useEffect, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import websocketService from '../../services/websocketService';
import LiveFleetMap from './LiveFleetMap';
import LiveTelemetryPanel from './LiveTelemetryPanel';
import AlertFeed from './AlertFeed';

const LiveFleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handler = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const unsubscribeStatus = websocketService.onStatusChange(setWsStatus);

    const unsubscribeTelemetry = websocketService.subscribe('/topic/telemetry', (data) => {
      setVehicles((prev) => {
        const exists = prev.find((v) => v.vehicleId === data.vehicleId);
        if (exists) {
          return prev.map((v) =>
            v.vehicleId === data.vehicleId ? { ...v, ...data } : v
          );
        }
        return [...prev, data];
      });
    });

    const unsubscribeAlerts = websocketService.subscribe('/topic/alerts', (data) => {
      const alertWithId = { ...data, id: `${data.vehicleId}-${data.type}-${Date.now()}` };
      setAlerts((prev) => [alertWithId, ...prev].slice(0, 50));
    });

    websocketService.connect().catch((err) => {
      console.error('[LiveFleetPage] WebSocket connection failed:', err);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeTelemetry();
      unsubscribeAlerts();
    };
  }, []);

  const handleAcknowledge = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const statusConfig = {
    connected: { label: 'Connected', color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    connecting: { label: 'Reconnecting…', color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/50' },
    disconnected: { label: 'Disconnected', color: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/50' },
  };

  const currentStatus = statusConfig[wsStatus] || statusConfig.disconnected;

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
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
          {/* MAP - 70% (8/12 cols on lg+) */}
          <div className="lg:col-span-8 h-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm h-full">
              <LiveFleetMap vehicles={vehicles} isDark={isDark} />
            </div>
          </div>

          {/* TELEMETRY PANEL - 30% (4/12 cols on lg+) */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm h-full">
              <LiveTelemetryPanel vehicles={vehicles} isDark={isDark} />
            </div>
          </div>
        </div>
      </main>

      {/* ALERT FEED OVERLAY */}
      <AlertFeed alerts={alerts} onAcknowledge={handleAcknowledge} isDark={isDark} />
    </div>
  );
};

export default LiveFleetPage;