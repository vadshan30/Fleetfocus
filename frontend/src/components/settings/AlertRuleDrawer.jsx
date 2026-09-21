import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import alertRuleService from '../../services/alertRuleService';
import Icon from '../ui/Icon';

const AlertRuleDrawer = ({ isOpen, onClose, onSave, initialData, isDark }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metric: 'SPEED',
    operator: 'GREATER_THAN',
    thresholdValue: '',
    severity: 'WARNING',
    vehicleId: '',
    quietHoursStart: '',
    quietHoursEnd: '',
    enableQuietHours: false,
    active: true,
  });
  const [vehicles, setVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const metrics = [
    { value: 'SPEED', label: 'Speed (km/h)' },
    { value: 'FUEL_LEVEL', label: 'Fuel Level (%)' },
    { value: 'ENGINE_TEMP', label: 'Engine Temperature (°C)' },
    { value: 'IDLE_DURATION', label: 'Idle Duration (min) — Coming Soon' },
    { value: 'HARSH_BRAKING', label: 'Harsh Braking (events) — Coming Soon' },
  ];

  const operators = [
    { value: 'GREATER_THAN', label: 'Greater Than ( > )' },
    { value: 'LESS_THAN', label: 'Less Than ( < )' },
    { value: 'EQUALS', label: 'Equals ( = )' },
  ];

  const severities = [
    { value: 'INFO', label: 'Info' },
    { value: 'WARNING', label: 'Warning' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      vehicleService.getAll().then(data => setVehicles(data.content || data || []));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          metric: initialData.metric || 'SPEED',
          operator: initialData.operator || 'GREATER_THAN',
          thresholdValue: initialData.thresholdValue !== undefined && initialData.thresholdValue !== null ? initialData.thresholdValue.toString() : '',
          severity: initialData.severity || 'WARNING',
          vehicleId: initialData.vehicleId !== undefined && initialData.vehicleId !== null ? initialData.vehicleId.toString() : '',
          quietHoursStart: initialData.quietHoursStart || '',
          quietHoursEnd: initialData.quietHoursEnd || '',
          enableQuietHours: !!(initialData.quietHoursStart && initialData.quietHoursEnd),
          active: initialData.active !== false,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          metric: 'SPEED',
          operator: 'GREATER_THAN',
          thresholdValue: '',
          severity: 'WARNING',
          vehicleId: '',
          quietHoursStart: '',
          quietHoursEnd: '',
          enableQuietHours: false,
          active: true,
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        metric: formData.metric,
        operator: formData.operator,
        thresholdValue: parseFloat(formData.thresholdValue),
        severity: formData.severity,
        vehicleId: formData.vehicleId ? parseInt(formData.vehicleId, 10) : null,
        quietHoursStart: formData.enableQuietHours ? formData.quietHoursStart : null,
        quietHoursEnd: formData.enableQuietHours ? formData.quietHoursEnd : null,
        active: formData.active,
      };

      if (initialData?.id) {
        await alertRuleService.update(initialData.id, payload);
      } else {
        await alertRuleService.create(payload);
      }

      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPreviewText = () => {
    const metric = metrics.find(m => m.value === formData.metric);
    const operator = operators.find(o => o.value === formData.operator);
    const severity = severities.find(s => s.value === formData.severity);
    const unit = formData.metric === 'SPEED' ? 'km/h' :
                 formData.metric === 'FUEL_LEVEL' ? '%' :
                 formData.metric === 'ENGINE_TEMP' ? '°C' : '';
    const thresholdDisplay = (formData.thresholdValue !== '' && formData.thresholdValue !== null && formData.thresholdValue !== undefined)
      ? formData.thresholdValue
      : '___';
    const unitDisplay = unit ? ` ${unit}` : '';
    return `IF ${metric?.label || formData.metric} ${operator?.label || formData.operator} ${thresholdDisplay}${unitDisplay} THEN raise ${severity?.label || formData.severity} alert`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Dimmed & Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer / Modal Dialog */}
      <div
        className="relative w-full max-w-lg sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col z-10 my-auto overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {initialData ? 'Edit Alert Rule' : 'Create Alert Rule'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set automated threshold breaches and notification triggers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-8rem)] scrollbar-thin">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
                <Icon name="AlertCircle" size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Live Preview Banner */}
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-sm">
              <div className="flex items-start gap-2.5">
                <Icon name="Info" size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300 mr-2">
                    Preview:
                  </span>
                  <span className="font-mono text-xs text-blue-700 dark:text-blue-300">
                    {getPreviewText()}
                  </span>
                </div>
              </div>
            </div>

            {/* Section: Basic Information */}
            <div className="space-y-4">
              <div className="pb-1 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Basic Info
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  required
                  placeholder="e.g., High Speed Alert"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-none"
                  placeholder="Optional description"
                />
              </div>
            </div>

            {/* Section: Rule Logic */}
            <div className="space-y-4">
              <div className="pb-1 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Rule Logic
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Metric <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.metric}
                  onChange={(e) => setFormData(prev => ({ ...prev, metric: e.target.value }))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                >
                  {metrics.map(m => (
                    <option key={m.value} value={m.value} disabled={m.value === 'IDLE_DURATION' || m.value === 'HARSH_BRAKING'}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition + Threshold Grid: Equal 2 columns with uniform height */}
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.operator}
                    onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                    className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  >
                    {operators.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Threshold Value <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.thresholdValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, thresholdValue: e.target.value }))}
                    className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                    required
                    placeholder="e.g., 90"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Severity <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                >
                  {severities.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Full Width Applies To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Applies To <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                >
                  <option value="">All Vehicles (Global Rule)</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} {v.model ? `- ${v.model}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Leave empty for global rule, or select a vehicle for per-vehicle override
                </p>
              </div>
            </div>

            {/* Section: Schedule & Quiet Hours */}
            <div className="space-y-4">
              <div className="pb-1 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Schedule & Status
                </h3>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.enableQuietHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableQuietHours: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Enable Quiet Hours
                  </span>
                </label>

                {formData.enableQuietHours && (
                  <div className="grid grid-cols-2 gap-4 pl-6 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Start Time (HH:mm)
                      </label>
                      <input
                        type="time"
                        value={formData.quietHoursStart}
                        onChange={(e) => setFormData(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                        className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        End Time (HH:mm)
                      </label>
                      <input
                        type="time"
                        value={formData.quietHoursEnd}
                        onChange={(e) => setFormData(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                        className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <label htmlFor="rule-active" className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="rule-active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Active Rule
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 text-sm shadow-sm flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                initialData ? 'Update Rule' : 'Create Rule'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertRuleDrawer;