import React, { useState, useEffect } from 'react';
import geofenceService from '../../services/geofenceService';
import Icon from '../ui/Icon';

const GeofenceDrawer = ({ isOpen, onClose, onSave, onPickFromMap, initialData, isDark }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'DEPOT',
    color: '#3b82f6',
    radiusMeters: 500,
    centerLat: '',
    centerLng: '',
    active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pickFromMap, setPickFromMap] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          type: initialData.type || 'DEPOT',
          color: initialData.color || '#3b82f6',
          radiusMeters: initialData.radiusMeters || 500,
          centerLat: initialData.centerLat?.toString() || '',
          centerLng: initialData.centerLng?.toString() || '',
          active: initialData.active !== false,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          type: 'DEPOT',
          color: '#3b82f6',
          radiusMeters: 500,
          centerLat: '',
          centerLng: '',
          active: true,
        });
      }
      setError(null);
      setPickFromMap(false);
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
        type: formData.type,
        color: formData.color,
        radiusMeters: parseFloat(formData.radiusMeters),
        centerLat: parseFloat(formData.centerLat),
        centerLng: parseFloat(formData.centerLng),
        active: formData.active,
      };

      if (initialData?.id) {
        await geofenceService.update(initialData.id, payload);
      } else {
        await geofenceService.create(payload);
      }

      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save geofence');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickFromMap = () => {
    setPickFromMap(true);
    onPickFromMap?.();
  };

  const types = [
    { value: 'RESTRICTED', label: 'Restricted Zone' },
    { value: 'DELIVERY_ZONE', label: 'Delivery Zone' },
    { value: 'DEPOT', label: 'Depot' },
    { value: 'CUSTOMER_SITE', label: 'Customer Site' },
  ];

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
      <div className={`${bgColor} w-full max-w-md sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-xl border ${borderColor} animate-slide-up`}>
        <div className="flex items-center justify-between p-4 border-b ${borderColor}">
          <h2 className="text-lg font-semibold ${textColor}">
            {initialData ? 'Edit Geofence' : 'Create Geofence'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Icon name="X" size={20} className={textColor} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium ${textColor} mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="e.g., Main Depot"
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
            <label className="block text-sm font-medium ${textColor} mb-1">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium ${textColor} mb-1">Radius (meters) *</label>
              <input
                type="number"
                value={formData.radiusMeters}
                onChange={(e) => setFormData(prev => ({ ...prev, radiusMeters: e.target.value }))}
                min="10"
                max="50000"
                className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium ${textColor} mb-1">Color</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 rounded-lg border ${inputBorder} cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium ${textColor} mb-1">Center Latitude *</label>
              <input
                type="number"
                step="0.000001"
                value={formData.centerLat}
                onChange={(e) => setFormData(prev => ({ ...prev, centerLat: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="e.g., 40.7128"
              />
            </div>
            <div>
              <label className="block text-sm font-medium ${textColor} mb-1">Center Longitude *</label>
              <input
                type="number"
                step="0.000001"
                value={formData.centerLng}
                onChange={(e) => setFormData(prev => ({ ...prev, centerLng: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="e.g., -74.0060"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePickFromMap}
            className={`w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${textColor} text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              pickFromMap ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon name={pickFromMap ? 'MapPin' : 'MousePointer'} size={16} />
            {pickFromMap ? 'Click on map to pick location...' : 'Pick location from map'}
          </button>

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

export default GeofenceDrawer;