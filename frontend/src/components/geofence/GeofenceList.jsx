import React, { useState, useEffect } from 'react';
import geofenceService from '../../services/geofenceService';
import GeofenceDrawer from './GeofenceDrawer';
import Icon from '../ui/Icon';

const GeofenceList = ({ onSelectGeofence, isDark }) => {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchGeofences = async () => {
    try {
      const data = await geofenceService.getAll();
      setGeofences(data || []);
    } catch (err) {
      console.error('Failed to fetch geofences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, []);

  const handleCreate = () => {
    setEditingGeofence(null);
    setDrawerOpen(true);
  };

  const handleEdit = (geofence) => {
    setEditingGeofence(geofence);
    setDrawerOpen(true);
  };

  const handleDrawerSave = () => {
    setDrawerOpen(false);
    setEditingGeofence(null);
    fetchGeofences();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this geofence?')) return;
    try {
      await geofenceService.deactivate(id);
      fetchGeofences();
    } catch (err) {
      console.error('Failed to delete geofence:', err);
    }
  };

  const handleToggleActive = async (geofence) => {
    try {
      await geofenceService.update(geofence.id, { ...geofence, active: !geofence.active });
      fetchGeofences();
    } catch (err) {
      console.error('Failed to toggle geofence:', err);
    }
  };

  const getTypeColor = (type, isDark) => {
    const colors = {
      RESTRICTED: isDark ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-100 text-rose-700 border-rose-200',
      DELIVERY_ZONE: isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200',
      DEPOT: isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200',
      CUSTOMER_SITE: isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[type] || colors.DEPOT;
  };

  const typeLabels = {
    RESTRICTED: 'Restricted',
    DELIVERY_ZONE: 'Delivery Zone',
    DEPOT: 'Depot',
    CUSTOMER_SITE: 'Customer Site',
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Geofences</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const hoverBg = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';

  return (
    <div className={`h-full flex flex-col ${bgColor} border-r ${borderColor}`}>
      <div className="p-4 border-b ${borderColor} flex items-center justify-between">
        <h3 className="font-semibold ${textColor}">Geofences</h3>
        <button
          onClick={handleCreate}
          className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Icon name="Plus" size={14} /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {geofences.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Icon name="MapPin" size={48} className={`${mutedColor} mb-3 opacity-50`} />
            <p className="text-sm ${mutedColor}">No geofences yet</p>
            <p className="text-xs ${mutedColor} mt-1">Click Add to create one</p>
          </div>
        ) : (
          geofences.map((geofence) => (
            <div
              key={geofence.id}
              onClick={() => onSelectGeofence(geofence)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${hoverBg} ${
                geofence.active ? '' : 'opacity-50'
              } ${borderColor}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: geofence.color || '#3b82f6' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm ${textColor} truncate">{geofence.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getTypeColor(geofence.type, isDark)}`}>
                      {typeLabels[geofence.type] || geofence.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs ${mutedColor}">
                    <span className="flex items-center gap-1">
                      <Icon name="Maximize" size={10} />
                      {geofence.radiusMeters}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="MapPin" size={10} />
                      {geofence.centerLat?.toFixed(4)}, {geofence.centerLng?.toFixed(4)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={geofence.active}
                    onChange={(e) => { e.stopPropagation(); handleToggleActive(geofence); }}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(geofence); }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${mutedColor} hover:text-slate-900 dark:hover:text-slate-100"
                      title="Edit"
                    >
                      <Icon name="Edit" size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(geofence.id); }}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500 hover:text-rose-700"
                      title="Delete"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <GeofenceDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingGeofence(null); }}
        onSave={handleDrawerSave}
        initialData={editingGeofence}
        isDark={isDark}
      />
    </div>
  );
};

export default GeofenceList;