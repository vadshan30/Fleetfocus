import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import alertService from '../../services/alertService';
import websocketService from '../../services/websocketService';
import AlertStatsCards from './AlertStatsCards';
import AlertFilters from './AlertFilters';
import BulkActionBar from './BulkActionBar';
import PurgeModal from './PurgeModal';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';

const AlertCenterPage = () => {
  const user = useSelector((state) => state.auth.user);
  const isManager = user?.role === 'FLEET_MANAGER' || user?.role === 'ROLE_FLEET_MANAGER';

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [newAlertsCount, setNewAlertsCount] = useState(0);

  const tableTopRef = useRef(null);

  const [filters, setFilters] = useState({
    severity: 'ALL',
    alertType: 'ALL',
    vehicleId: undefined,
    acknowledged: undefined,
    resolved: undefined,
    from: '',
    to: '',
  });

  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    unacknowledged: 0,
    resolved: 0,
    oldestUnacked: null,
    last24h: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const data = await alertService.getStats();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch alert stats:', err);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await alertService.getAlerts(filters, page, size);
      setAlerts(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, size]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // WebSocket live alerts integration
  useEffect(() => {
    const unsubscribe = websocketService.subscribe('/topic/alerts', (newAlert) => {
      if (!newAlert || !newAlert.id) return;

      // Increment stats locally
      setStats((prev) => ({
        ...prev,
        total: (prev.total || 0) + 1,
        unacknowledged: (prev.unacknowledged || 0) + 1,
        last24h: (prev.last24h || 0) + 1,
        critical: newAlert.severity === 'CRITICAL' ? (prev.critical || 0) + 1 : prev.critical,
        warning: newAlert.severity === 'WARNING' ? (prev.warning || 0) + 1 : prev.warning,
      }));

      // If viewing the first page without strict conflicting filters, prepend to table
      const matchesFilter =
        (filters.severity === 'ALL' || filters.severity === newAlert.severity) &&
        (filters.alertType === 'ALL' || filters.alertType === newAlert.alertType) &&
        (!filters.vehicleId || String(filters.vehicleId) === String(newAlert.vehicleId)) &&
        filters.resolved !== true;

      if (matchesFilter && page === 0) {
        setAlerts((prev) => [newAlert, ...prev.slice(0, size - 1)]);
        setTotalElements((prev) => prev + 1);
      } else {
        setNewAlertsCount((prev) => prev + 1);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [filters, page, size]);

  const handleFilterChange = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      severity: 'ALL',
      alertType: 'ALL',
      vehicleId: undefined,
      acknowledged: undefined,
      resolved: undefined,
      from: '',
      to: '',
    });
    setPage(0);
  };

  const handleScrollToTopAndRefresh = () => {
    setNewAlertsCount(0);
    setPage(0);
    fetchAlerts();
    fetchStats();
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = alerts.map((a) => a.id);
      setSelectedIds(pageIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Row inline actions
  const handleAcknowledge = async (id) => {
    try {
      await alertService.acknowledge(id);
      if (window.addNotification) {
        window.addNotification('Alert acknowledged.', 'info');
      }
      fetchAlerts();
      fetchStats();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      if (window.addNotification) {
        window.addNotification('Failed to acknowledge alert.', 'error');
      }
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertService.resolve(id);
      if (window.addNotification) {
        window.addNotification('Alert resolved successfully.', 'success');
      }
      fetchAlerts();
      fetchStats();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      if (window.addNotification) {
        window.addNotification('Failed to resolve alert.', 'error');
      }
    }
  };

  // Bulk actions
  const handleBulkAcknowledge = async () => {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    try {
      const res = await alertService.bulkAcknowledge(selectedIds);
      if (window.addNotification) {
        window.addNotification(`Acknowledged ${res.updated ?? selectedIds.length} alerts.`, 'info');
      }
      setSelectedIds([]);
      fetchAlerts();
      fetchStats();
    } catch (err) {
      console.error('Bulk acknowledge failed:', err);
      if (window.addNotification) {
        window.addNotification('Bulk acknowledge failed.', 'error');
      }
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkResolve = async () => {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    try {
      const res = await alertService.bulkResolve(selectedIds);
      if (window.addNotification) {
        window.addNotification(`Resolved ${res.updated ?? selectedIds.length} alerts.`, 'success');
      }
      setSelectedIds([]);
      fetchAlerts();
      fetchStats();
    } catch (err) {
      console.error('Bulk resolve failed:', err);
      if (window.addNotification) {
        window.addNotification('Bulk resolve failed.', 'error');
      }
    } finally {
      setBulkLoading(false);
    }
  };

  // Admin Purge
  const handlePurgeConfirm = async (olderThanDays) => {
    setPurgeLoading(true);
    try {
      const res = await alertService.purgeOld(olderThanDays);
      if (window.addNotification) {
        window.addNotification(`Purged ${res.deleted ?? 0} resolved alerts older than ${olderThanDays} days.`, 'success');
      }
      setIsPurgeOpen(false);
      fetchAlerts();
      fetchStats();
    } catch (err) {
      console.error('Purge failed:', err);
      if (window.addNotification) {
        window.addNotification('Failed to purge old alerts.', 'error');
      }
    } finally {
      setPurgeLoading(false);
    }
  };

  const allSelected = alerts.length > 0 && alerts.every((a) => selectedIds.includes(a.id));

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto" ref={tableTopRef}>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Alert Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                Active Monitoring
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time geofence breaches, critical telemetry thresholds, and bulk alert triage.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isManager && (
              <button
                onClick={() => setIsPurgeOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-all shadow-sm"
              >
                <Icon name="Trash2" size={14} />
                <span>Purge Old Alerts</span>
              </button>
            )}

            <button
              onClick={() => {
                fetchAlerts();
                fetchStats();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-all shadow-sm"
            >
              <Icon name="RotateCcw" size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <AlertStatsCards stats={stats} />

        {/* Filters */}
        <AlertFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selectedIds.length}
          onAcknowledgeSelected={handleBulkAcknowledge}
          onResolveSelected={handleBulkResolve}
          onClearSelection={() => setSelectedIds([])}
          loading={bulkLoading}
        />

        {/* Real-time Pill Banner */}
        {newAlertsCount > 0 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleScrollToTopAndRefresh}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all animate-bounce"
            >
              <Icon name="ArrowUp" size={14} />
              <span>{newAlertsCount} new alert{newAlertsCount > 1 ? 's' : ''} received. Click to review</span>
            </button>
          </div>
        )}

        {/* Alerts Table Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      aria-label="Select all alerts on page"
                    />
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Rule / Geofence
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" /></td>
                      <td className="py-4 px-4 text-right"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : alerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
                        <Icon name="Bell" size={28} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        No alerts match your filters
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                        Try clearing active filters or changing your date range to view historical alerts.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => {
                    const isSelected = selectedIds.includes(alert.id);
                    return (
                      <tr
                        key={alert.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-blue-50/50 dark:bg-blue-950/20'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(alert.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                            aria-label={`Select alert ${alert.id}`}
                          />
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {alert.occurredAt ? new Date(alert.occurredAt).toLocaleString() : '—'}
                        </td>

                        {/* Vehicle */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {alert.licensePlate || `Vehicle #${alert.vehicleId}`}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            ID: {alert.vehicleId}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {alert.alertType === 'RULE_BREACH' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                              <Icon name="AlertTriangle" size={11} />
                              Rule Breach
                            </span>
                          ) : alert.alertType === 'GEOFENCE_ENTER' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                              <Icon name="LogIn" size={11} />
                              Geofence Enter
                            </span>
                          ) : alert.alertType === 'GEOFENCE_EXIT' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                              <Icon name="LogOut" size={11} />
                              Geofence Exit
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              {alert.alertType || '—'}
                            </span>
                          )}
                        </td>

                        {/* Severity */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={alert.severity} />
                        </td>

                        {/* Rule / Geofence */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                            {alert.ruleName || alert.geofenceName || alert.message || 'Threshold Triggered'}
                          </div>
                          {alert.metric && (
                            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                              {alert.metric}: {alert.actualValue ?? '—'} vs limit {alert.thresholdValue ?? '—'}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {alert.resolved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900">
                              <Icon name="CheckCircle2" size={11} /> Resolved
                            </span>
                          ) : alert.acknowledged ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900">
                              <Icon name="Check" size={11} /> Acknowledged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900">
                              <Icon name="Clock" size={11} /> Unread
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {!alert.acknowledged && !alert.resolved && (
                              <button
                                onClick={() => handleAcknowledge(alert.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-md transition-colors"
                                title="Acknowledge alert"
                              >
                                Acknowledge
                              </button>
                            )}
                            {!alert.resolved && (
                              <button
                                onClick={() => handleResolve(alert.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md transition-colors"
                                title="Resolve alert"
                              >
                                Resolve
                              </button>
                            )}
                            {alert.resolved && (
                              <span className="text-[11px] text-slate-400 dark:text-slate-600 italic">
                                Closed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Footer */}
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {totalElements > 0 ? page * size + 1 : 0}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {Math.min((page + 1) * size, totalElements)}
                </strong>{' '}
                of{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {totalElements.toLocaleString()}
                </strong>{' '}
                alerts
              </span>

              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[11px]">Per page:</span>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="h-7 px-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="ChevronLeft" size={14} />
                <span>Previous</span>
              </button>

              <span className="px-2 text-slate-600 dark:text-slate-400">
                Page <strong>{totalPages > 0 ? page + 1 : 1}</strong> of{' '}
                <strong>{totalPages || 1}</strong>
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <Icon name="ChevronRight" size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Purge Modal */}
        <PurgeModal
          isOpen={isPurgeOpen}
          onClose={() => setIsPurgeOpen(false)}
          onConfirm={handlePurgeConfirm}
          loading={purgeLoading}
        />
      </div>
    </div>
  );
};

export default AlertCenterPage;