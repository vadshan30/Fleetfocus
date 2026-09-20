import React, { useEffect, useState } from 'react';
import vehicleService from '../../services/vehicleService';
import Icon from '../ui/Icon';

const AlertFilters = ({ filters, onFilterChange, onReset }) => {
  const [vehicles, setVehicles] = useState([]);
  const [datePreset, setDatePreset] = useState('ALL');

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await vehicleService.getAll(0, 100);
        const list = res?.content || (Array.isArray(res) ? res : []);
        setVehicles(list);
      } catch (err) {
        console.error('Failed to load vehicles for filter:', err);
      }
    };
    loadVehicles();
  }, []);

  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'ALL') {
      onFilterChange({ from: '', to: '' });
      return;
    }

    let fromDate = new Date();
    if (preset === '24H') {
      fromDate.setHours(fromDate.getHours() - 24);
    } else if (preset === '7D') {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (preset === '30D') {
      fromDate.setDate(fromDate.getDate() - 30);
    }

    if (preset !== 'CUSTOM') {
      onFilterChange({
        from: fromDate.toISOString().slice(0, 19),
        to: now.toISOString().slice(0, 19),
      });
    }
  };

  const handleClear = () => {
    setDatePreset('ALL');
    onReset();
  };

  const selectClass =
    'h-9 px-3 text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';
  const inputClass =
    'h-9 px-2.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Icon name="Filter" size={14} className="text-blue-500" />
          <span>Filter Alerts</span>
        </div>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <Icon name="RotateCcw" size={12} />
          <span>Clear Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {/* Severity */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Severity
          </label>
          <select
            value={filters.severity || 'ALL'}
            onChange={(e) => onFilterChange({ severity: e.target.value })}
            className={`w-full ${selectClass}`}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Status
          </label>
          <select
            value={
              filters.resolved === true
                ? 'RESOLVED'
                : filters.acknowledged === true
                ? 'ACKNOWLEDGED'
                : filters.acknowledged === false
                ? 'UNACKNOWLEDGED'
                : 'ALL'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'ALL') {
                onFilterChange({ acknowledged: undefined, resolved: undefined });
              } else if (val === 'UNACKNOWLEDGED') {
                onFilterChange({ acknowledged: false, resolved: undefined });
              } else if (val === 'ACKNOWLEDGED') {
                onFilterChange({ acknowledged: true, resolved: undefined });
              } else if (val === 'RESOLVED') {
                onFilterChange({ acknowledged: undefined, resolved: true });
              }
            }}
            className={`w-full ${selectClass}`}
          >
            <option value="ALL">All Statuses</option>
            <option value="UNACKNOWLEDGED">Unacknowledged</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* Alert Type */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Alert Type
          </label>
          <select
            value={filters.alertType || 'ALL'}
            onChange={(e) => onFilterChange({ alertType: e.target.value })}
            className={`w-full ${selectClass}`}
          >
            <option value="ALL">All Alert Types</option>
            <option value="RULE_BREACH">Rule Breach</option>
            <option value="GEOFENCE_ENTER">Geofence Enter</option>
            <option value="GEOFENCE_EXIT">Geofence Exit</option>
          </select>
        </div>

        {/* Vehicle */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Vehicle
          </label>
          <select
            value={filters.vehicleId || 'ALL'}
            onChange={(e) =>
              onFilterChange({
                vehicleId: e.target.value === 'ALL' ? undefined : e.target.value,
              })
            }
            className={`w-full ${selectClass}`}
          >
            <option value="ALL">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.licensePlate || `Vehicle #${v.id}`} ({v.model || v.make || 'Fleet'})
              </option>
            ))}
          </select>
        </div>

        {/* Date Preset */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Date Range
          </label>
          <select
            value={datePreset}
            onChange={(e) => handleDatePresetChange(e.target.value)}
            className={`w-full ${selectClass}`}
          >
            <option value="ALL">All Time</option>
            <option value="24H">Last 24 Hours</option>
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>

        {/* Custom Date Pickers */}
        {datePreset === 'CUSTOM' ? (
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                From
              </label>
              <input
                type="date"
                value={filters.from ? filters.from.slice(0, 10) : ''}
                onChange={(e) => onFilterChange({ from: e.target.value ? `${e.target.value}T00:00:00` : '' })}
                className={`w-full ${inputClass}`}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                To
              </label>
              <input
                type="date"
                value={filters.to ? filters.to.slice(0, 10) : ''}
                onChange={(e) => onFilterChange({ to: e.target.value ? `${e.target.value}T23:59:59` : '' })}
                className={`w-full ${inputClass}`}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AlertFilters;
