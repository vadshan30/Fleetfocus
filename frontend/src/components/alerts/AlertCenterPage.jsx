import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import alertService from '../../services/alertService';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';

const AlertCenterPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    severity: 'ALL',
    status: 'ALL',
    alertType: 'ALL',
    startDate: '',
    endDate: '',
  });
  const [stats, setStats] = useState({
    unacknowledged: 0,
    critical: 0,
    warning: 0,
    info: 0,
  });

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size };
      if (filters.severity !== 'ALL') params.severity = filters.severity;
      if (filters.alertType !== 'ALL') params.alertType = filters.alertType;
      if (filters.status === 'UNACKNOWLEDGED') params.acknowledged = false;
      else if (filters.status === 'ACKNOWLEDGED') params.acknowledged = true;
      if (filters.status === 'RESOLVED') params.resolved = true;
      else if (filters.status === 'UNRESOLVED') params.resolved = false;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await alertService.getAll(params);
      setAlerts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await alertService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [fetchAlerts, fetchStats]);

  const handleAcknowledge = async (id) => {
    try {
      await alertService.acknowledge(id);
      fetchAlerts();
      fetchStats();
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertService.resolve(id);
      fetchAlerts();
      fetchStats();
    } catch (err) {
      console.error('Failed to resolve:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const severityOptions = [
    { value: 'ALL', label: 'All Severities' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'WARNING', label: 'Warning' },
    { value: 'INFO', label: 'Info' },
  ];

  const alertTypeOptions = [
    { value: 'ALL', label: 'All Types' },
    { value: 'RULE_BREACH', label: 'Rule Breach' },
    { value: 'GEOFENCE_ENTER', label: 'Geofence Enter' },
    { value: 'GEOFENCE_EXIT', label: 'Geofence Exit' },
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'UNACKNOWLEDGED', label: 'Unacknowledged' },
    { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'UNRESOLVED', label: 'Unresolved' },
  ];

  const statCards = [
    { label: 'Critical', value: stats.critical, color: 'rose', icon: 'AlertTriangle' },
    { label: 'Warning', value: stats.warning, color: 'amber', icon: 'AlertTriangle' },
    { label: 'Info', value: stats.info, color: 'blue', icon: 'Info' },
    { label: 'Unacknowledged', value: stats.unacknowledged, color: 'purple', icon: 'Bell' },
    { label: 'Rule Breach', value: stats.ruleBreach, color: 'purple', icon: 'AlertTriangle' },
    { label: 'Geofence Enter', value: stats.geofenceEnter, color: 'emerald', icon: 'LogIn' },
    { label: 'Geofence Exit', value: stats.geofenceExit, color: 'blue', icon: 'LogOut' },
  ];

  const columns = [
    {
      header: 'Time',
      accessor: 'occurredAt',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
          {row.occurredAt ? new Date(row.occurredAt).toLocaleString() : '--'}
        </span>
      ),
    },
    {
      header: 'Vehicle',
      accessor: 'vehicleId',
      render: (row) => (
        <div>
          <div className="font-mono font-medium text-slate-900 dark:text-slate-100 text-sm">
            {row.licensePlate || 'Unknown'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">ID: {row.vehicleId}</div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'alertType',
      render: (row) => {
        const type = row.alertType;
        if (type === 'RULE_BREACH') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400">
              <Icon name="AlertTriangle" size={10} />
              Rule Breach
            </span>
          );
        }
        if (type === 'GEOFENCE_ENTER') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Icon name="LogIn" size={10} />
              Geofence Enter
            </span>
          );
        }
        if (type === 'GEOFENCE_EXIT') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              <Icon name="LogOut" size={10} />
              Geofence Exit
            </span>
          );
        }
        return <span className="text-xs text-slate-500 dark:text-slate-400">{type || '—'}</span>;
      },
    },
    {
      header: 'Event',
      accessor: 'eventType',
      render: (row) => {
        if (row.alertType === 'RULE_BREACH') {
          return (
            <div>
              <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                {row.ruleName || 'Rule Breach'}
              </div>
              {row.metric && (
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {row.metric}: {row.actualValue} vs {row.thresholdValue}
                </div>
              )}
            </div>
          );
        }
        const isEnter = row.eventType === 'ENTER';
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            isEnter
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
          }`}>
            <Icon name={isEnter ? 'LogIn' : 'LogOut'} size={10} />
            {isEnter ? 'Entered' : 'Exited'}
          </span>
        );
      },
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (row) => (
        <StatusBadge status={row.severity} />
      ),
    },
    {
      header: 'Status',
      accessor: 'acknowledged',
      render: (row) => {
        if (row.resolved) {
          return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"><Icon name="CheckCircle2" size={10} /> Resolved</span>;
        }
        if (row.acknowledged) {
          return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"><Icon name="Check" size={10} /> Acknowledged</span>;
        }
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"><Icon name="AlertCircle" size={10} /> Unacknowledged</span>;
      },
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          {!row.acknowledged && !row.resolved && (
            <>
              <button
                onClick={() => handleAcknowledge(row.id)}
                className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Acknowledge"
              >
                <Icon name="Check" size={12} />
              </button>
              <button
                onClick={() => handleResolve(row.id)}
                className="px-2 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                title="Resolve"
              >
                <Icon name="CheckCircle2" size={12} />
              </button>
            </>
          )}
          {row.acknowledged && !row.resolved && (
            <button
              onClick={() => handleResolve(row.id)}
              className="px-2 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
              title="Resolve"
            >
              <Icon name="CheckCircle2" size={12} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const bgColor = 'bg-white dark:bg-slate-900';
  const borderColor = 'border-slate-200/80 dark:border-slate-800';
  const textColor = 'text-slate-900 dark:text-slate-50';
  const mutedColor = 'text-slate-500 dark:text-slate-400';
  const inputBg = 'bg-white dark:bg-slate-800';
  const inputBorder = 'border-slate-200 dark:border-slate-700';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold ${textColor}">Alert Center</h1>
          <p className="${mutedColor} mt-1">Manage and track all geofence and threshold alerts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => (
            <div key={stat.label} className={`p-4 rounded-xl border ${borderColor} shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-950/50`}>
                  <Icon name={stat.icon} size={20} className={`text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div>
                  <div className="text-2xl font-bold ${textColor}">{stat.value}</div>
                  <div className="text-xs ${mutedColor}">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`bg-white dark:bg-slate-900 border ${borderColor} rounded-xl shadow-sm`}>
          <div className="p-4 border-b ${borderColor} flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium ${textColor} mb-1">Filters</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {severityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select
                  value={filters.alertType}
                  onChange={(e) => handleFilterChange('alertType', e.target.value)}
                  className="px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {alertTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto" />
              <p className="${mutedColor} mt-2">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center">
              <Icon name="Bell" size={48} className={`${mutedColor} mx-auto mb-3 opacity-50`} />
              <p className="${textColor}">No alerts found</p>
              <p className="${mutedColor} mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b ${borderColor} bg-slate-50 dark:bg-slate-800/50">
                      {columns.map((col, i) => (
                        <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${mutedColor}">
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {alerts.map((alert, rowIndex) => (
                      <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {columns.map((col, colIndex) => (
                          <td key={colIndex} className="px-4 py-3">
                            {col.render(alert)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t ${borderColor} flex items-center justify-between">
                  <p className="text-sm ${mutedColor}">
                    Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} alerts
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => p - 1)}
                      disabled={page === 0}
                      className="px-3 py-1.5 text-sm border ${inputBorder} ${inputBg} ${textColor} rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1.5 text-sm border ${inputBorder} ${inputBg} ${textColor} rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCenterPage;