import React, { useState, useEffect, useCallback } from 'react';
import alertRuleService from '../../services/alertRuleService';
import AlertRuleDrawer from './AlertRuleDrawer';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';

const AlertRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [filters, setFilters] = useState({
    severity: 'ALL',
    metric: 'ALL',
    active: 'ALL',
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await alertRuleService.getAll();
      setRules(data || []);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleCreate = () => {
    setEditingRule(null);
    setDrawerOpen(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    setDrawerOpen(false);
    setEditingRule(null);
    fetchRules();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this rule?')) return;
    try {
      await alertRuleService.deactivate(id);
      fetchRules();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const metricLabels = {
    SPEED: 'Speed',
    FUEL_LEVEL: 'Fuel Level',
    ENGINE_TEMP: 'Engine Temp',
    IDLE_DURATION: 'Idle Duration',
    HARSH_BRAKING: 'Harsh Braking',
  };

  const operatorLabels = {
    GREATER_THAN: '>',
    LESS_THAN: '<',
    EQUALS: '=',
  };

  const filteredRules = rules.filter(rule => {
    if (filters.severity !== 'ALL' && rule.severity !== filters.severity) return false;
    if (filters.metric !== 'ALL' && rule.metric !== filters.metric) return false;
    if (filters.active === 'ACTIVE' && !rule.active) return false;
    if (filters.active === 'INACTIVE' && rule.active) return false;
    return true;
  });

  const severityOptions = [
    { value: 'ALL', label: 'All Severities' },
    { value: 'INFO', label: 'Info' },
    { value: 'WARNING', label: 'Warning' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const metricOptions = [
    { value: 'ALL', label: 'All Metrics' },
    { value: 'SPEED', label: 'Speed' },
    { value: 'FUEL_LEVEL', label: 'Fuel Level' },
    { value: 'ENGINE_TEMP', label: 'Engine Temp' },
  ];

  const activeOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold ${textColor}">Alert Rules</h1>
              <p className="${mutedColor} mt-1">Configure threshold-based alerts for fleet telemetry</p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
            >
              <Icon name="Plus" size={18} />
              New Rule
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${borderColor} shadow-sm`}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {severityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              value={filters.metric}
              onChange={(e) => setFilters(prev => ({ ...prev, metric: e.target.value }))}
              className="px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {metricOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              value={filters.active}
              onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
              className="px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {activeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto" />
              <p className="${mutedColor} mt-2">Loading rules...</p>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="p-8 text-center">
              <Icon name="AlertTriangle" size={48} className="${mutedColor} mx-auto mb-3 opacity-50" />
              <p className="${textColor}">No alert rules configured</p>
              <p className="${mutedColor} mt-1">Click "New Rule" to create your first alert rule</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b ${borderColor} bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${mutedColor}">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${mutedColor}">Metric</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${mutedColor}">Condition</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${mutedColor}">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${mutedColor}">Applies To</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${mutedColor}">Quiet Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${mutedColor}">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${mutedColor}">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="font-medium ${textColor}">{rule.name}</div>
                        {rule.description && <div className="text-xs ${mutedColor}">{rule.description}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                          {metricLabels[rule.metric] || rule.metric}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm ${textColor}">
                          {operatorLabels[rule.operator] || rule.operator} {rule.thresholdValue}
                          {rule.metric === 'SPEED' && ' km/h'}
                          {rule.metric === 'FUEL_LEVEL' && '%'}
                          {rule.metric === 'ENGINE_TEMP' && '°C'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={rule.severity} />
                      </td>
                      <td className="px-4 py-3">
                        {rule.vehicleId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                            <Icon name="Truck" size={10} />
                            Override
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <Icon name="Globe" size={10} />
                            Global
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {rule.quietHoursStart && rule.quietHoursEnd ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Icon name="Moon" size={10} />
                            {rule.quietHoursStart} - {rule.quietHoursEnd}
                          </span>
                        ) : (
                          <span className="${mutedColor} text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {rule.active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${mutedColor} hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                            title="Edit"
                          >
                            <Icon name="Edit" size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500 hover:text-rose-700 transition-colors"
                            title="Delete"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AlertRuleDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingRule(null); }}
        onSave={handleSave}
        initialData={editingRule}
        isDark={false}
      />
    </div>
  );
};

export default AlertRulesPage;