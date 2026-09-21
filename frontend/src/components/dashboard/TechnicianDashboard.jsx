import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import maintenanceService from '../../services/maintenanceService';
import alertService from '../../services/alertService';
import api from '../../services/api';

// UI Components
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import Icon from '../ui/Icon';
import ErrorState from '../common/ErrorState';

const TechnicianDashboard = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTechnicianData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsData, vehiclesData, alertsData] = await Promise.all([
        maintenanceService.getAll().catch(() => []),
        api.get('/vehicles?page=0&size=100').then((r) => r.data?.content || r.data || []).catch(() => []),
        alertService.getAlerts({ resolved: false }, 0, 30).then((r) => r.content || r || []).catch(() => []),
      ]);
      setLogs(Array.isArray(logsData) ? logsData : []);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);

      const alertsList = Array.isArray(alertsData) ? alertsData : [];
      // Filter alerts for CRITICAL or WARNING severity
      const filtered = alertsList.filter(
        (a) => a.severity === 'CRITICAL' || a.severity === 'WARNING'
      );
      setCriticalAlerts(filtered);
    } catch (err) {
      console.error('Failed to fetch technician data:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load maintenance desk data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechnicianData();
  }, [fetchTechnicianData]);

  const serviceInterval = 5000;
  const vehiclesDue = vehicles
    .map((v) => {
      const currentMileage = v.currentMileage || 0;
      const nextService = Math.floor(currentMileage / serviceInterval + 1) * serviceInterval;
      const kmLeft = Math.max(0, nextService - currentMileage);
      return {
        ...v,
        currentMileage,
        nextService,
        kmLeft,
        isOverdue: currentMileage >= nextService,
        isDueSoon: kmLeft < 500 && kmLeft > 0,
      };
    })
    .filter((v) => v.isOverdue || v.isDueSoon)
    .sort((a, b) => a.kmLeft - b.kmLeft);

  const overdueCount = vehiclesDue.filter((v) => v.isOverdue).length;
  const underMaintenanceCount = vehicles.filter(
    (v) => v.status === 'UNDER_MAINTENANCE' || v.status === 'MAINTENANCE'
  ).length;

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await alertService.acknowledge(alertId);
      setCriticalAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await alertService.resolve(alertId);
      setCriticalAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
        <Icon name="RefreshCw" size={24} className="animate-spin text-amber-500" />
        <span>Loading maintenance desk...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto py-12">
        <ErrorState message={error} onRetry={fetchTechnicianData} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-amber-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
              <Icon name="Wrench" size={12} /> Maintenance Workshop Station
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Vehicle Health & Service Desk
            </h1>
            <p className="mt-1 text-amber-200 text-xs sm:text-sm max-w-xl">
              Inspect service intervals, resolve critical vehicle alerts, and record maintenance logs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/maintenance')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2"
            >
              <Icon name="PlusCircle" size={16} />
              <span>Log Service Work</span>
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2"
            >
              <Icon name="Bell" size={16} />
              <span>Alert Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="cursor-pointer h-full" onClick={() => navigate('/maintenance')}>
          <StatCard
            className="h-full"
            icon="Wrench"
            iconColor="amber"
            label="Under Maintenance"
            value={underMaintenanceCount}
            subtext="Vehicles currently in workshop"
          />
        </div>
        <div className="cursor-pointer h-full" onClick={() => navigate('/maintenance')}>
          <StatCard
            className="h-full"
            icon="AlertTriangle"
            iconColor="red"
            label="Service Overdue"
            value={overdueCount}
            subtext="Vehicles past mileage threshold"
          />
        </div>
        <div className="cursor-pointer h-full" onClick={() => navigate('/alerts')}>
          <StatCard
            className="h-full"
            icon="ShieldAlert"
            iconColor="rose"
            label="Critical / Warning Alerts"
            value={criticalAlerts.length}
            subtext="Requiring technician resolution"
          />
        </div>
        <div className="cursor-pointer h-full" onClick={() => navigate('/maintenance')}>
          <StatCard
            className="h-full"
            icon="ClipboardList"
            iconColor="blue"
            label="Recorded Logs"
            value={logs.length}
            subtext="Completed service entries"
          />
        </div>
      </div>

      {/* VEHICLES DUE FOR SERVICE & CRITICAL ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VEHICLES DUE FOR SERVICE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Icon name="Clock" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Vehicles Due for Service
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Based on 5,000 km standard service intervals
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {vehiclesDue.length} Due
            </span>
          </div>

          {vehiclesDue.length === 0 ? (
            <div className="py-12 text-center text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-2">
              <Icon name="CheckCircle2" size={18} />
              <span>All vehicles are within safe service intervals</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {vehiclesDue.map((v) => (
                <div
                  key={v.id}
                  onClick={() => navigate('/maintenance', { state: { vehicleId: v.id } })}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    v.isOverdue
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={v.isOverdue ? 'AlertOctagon' : 'Clock'}
                      size={20}
                      className={v.isOverdue ? 'text-rose-500' : 'text-amber-500'}
                    />
                    <div>
                      <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {v.licensePlate} · {v.model}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Mileage: {v.currentMileage.toFixed(0)} km ·{' '}
                        {v.isOverdue
                          ? `Overdue by ${(v.currentMileage - v.nextService).toFixed(0)} km`
                          : `${v.kmLeft.toFixed(0)} km until service`}
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

        {/* CRITICAL ALERTS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Icon name="ShieldAlert" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Critical Technical Alerts
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  High-priority telemetry warnings & vehicle failures
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Open Center
            </button>
          </div>

          {criticalAlerts.length === 0 ? (
            <div className="py-12 text-center text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-2">
              <Icon name="CheckCircle2" size={18} />
              <span>No critical or warning alerts pending resolution</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {criticalAlerts.slice(0, 6).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {alert.alertType || alert.type || 'Alert'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Vehicle #{alert.vehicleId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {alert.message || `Occurred: ${new Date(alert.occurredAt).toLocaleString()}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-semibold transition-colors"
                      >
                        Ack
                      </button>
                    )}
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECENT MAINTENANCE LOGS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Icon name="History" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                Recent Maintenance Work Orders
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Completed service history and parts inspections
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/maintenance')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Logs</span>
            <Icon name="ChevronRight" size={12} />
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No maintenance records filed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Service Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.slice(0, 6).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {log.vehicle?.licensePlate || `Vehicle #${log.vehicle?.id}`}
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                      {log.serviceDate ? new Date(log.serviceDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {log.description || 'Routine maintenance'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                      {log.technician?.username || 'Workshop Staff'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                      ${log.cost ? log.cost.toFixed(2) : '0.00'}
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

export default TechnicianDashboard;
