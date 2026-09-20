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
    { value: 'GREATER_THAN', label: 'Greater Than (> )' },
    { value: 'LESS_THAN', label: 'Less Than (< )' },
    { value: 'EQUALS', label: 'Equals (=)' },
  ];

  const severities = [
    { value: 'INFO', label: 'Info' },
    { value: 'WARNING', label: 'Warning' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

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
          thresholdValue: initialData.thresholdValue?.toString() || '',
          severity: initialData.severity || 'WARNING',
          vehicleId: initialData.vehicleId?.toString() || '',
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
        name: formData.name,
        description: formData.description,
        metric: formData.metric,
        operator: formData.operator,
        thresholdValue: parseFloat(formData.thresholdValue),
        severity: formData.severity,
        vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : null,
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
    return `IF ${metric?.label || formData.metric} ${operator?.label || formData.operator} ${formData.thresholdValue} ${unit} THEN raise ${severity?.label || formData.severity} alert`;
  };

  if (!isOpen) return null;

  const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-slate-800' : 'bg-white';
  const inputBorder = isDark ? 'border-slate-600' : 'border-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`${bgColor} w-full max-w-md sm:max-w-2xl rounded-t-2xl sm:rounded-xl shadow-xl border ${borderColor} animate-slide-up`}>
        <div className="flex items-center justify-between p-4 border-b ${borderColor}">
          <h2 className="text-lg font-semibold ${textColor}">
            {initialData ? 'Edit Alert Rule' : 'Create Alert Rule'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Icon name="X" size={20} className={textColor} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-800 dark:text-blue-300">Preview:</span>
              <span className="text-blue-700 dark:text-blue-400 font-mono text-xs">{getPreviewText()}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium ${textColor} mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="e.g., High Speed Alert"
            />
          </div>

          <div>
            <label className="block text-sm font-medium ${textColor} mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium ${textColor} mb-1">Metric *</label>
            <select
              value={formData.metric}
              onChange={(e) => setFormData(prev => ({ ...prev, metric: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {metrics.map(m => <option key={m.value} value={m.value} disabled={m.value === 'IDLE_DURATION' || m.value === 'HARSH_BRAKING'}>{m.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium ${textColor} mb-1">Condition *</label>
              <select
                value={formData.operator}
                onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium ${textColor} mb-1">Threshold Value *</label>
              <input
                type="number"
                step="0.1"
                value={formData.thresholdValue}
                onChange={(e) => setFormData(prev => ({ ...prev, thresholdValue: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="e.g., 90"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium ${textColor} mb-1">Severity *</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {severities.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium ${textColor} mb-1">Applies To *</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Vehicles (Global Rule)</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.licensePlate} - {v.model}</option>
              ))}
            </select>
            <p className="text-xs ${mutedColor} mt-1">Leave empty for global rule, or select a vehicle for per-vehicle override</p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableQuietHours}
                onChange={(e) => setFormData(prev => ({ ...prev, enableQuietHours: e.target.checked }))}
                className="w-4 h-4 rounded border-${inputBorder} text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm ${textColor}">Enable Quiet Hours</span>
            </label>
            {formData.enableQuietHours && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div>
                  <label className="block text-sm font-medium ${textColor} mb-1">Quiet Hours Start (HH:mm)</label>
                  <input
                    type="time"
                    value={formData.quietHoursStart}
                    onChange={(e) => setFormData(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium ${textColor} mb-1">Quiet Hours End (HH:mm)</label>
                  <input
                    type="time"
                    value={formData.quietHoursEnd}
                    onChange={(e) => setFormData(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="w-4 h-4 rounded border-${inputBorder} text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm ${textColor} cursor-pointer">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border ${inputBorder} ${textColor} font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertRuleDrawer;