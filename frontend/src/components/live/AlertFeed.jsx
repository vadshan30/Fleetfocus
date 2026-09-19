import React, { useState, useEffect, useCallback } from 'react';
import alertService from '../../services/alertService';
import Icon from '../ui/Icon';

const AlertItem = ({ alert, onAcknowledge, onResolve, isDark }) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(alert.acknowledged || false);
  const [resolved, setResolved] = useState(alert.resolved || false);

  useEffect(() => {
    if (!acknowledged && !resolved) {
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => setVisible(false), 200);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [acknowledged, resolved]);

  if (!visible) return null;

  const isGeofence = alert.type?.startsWith('GEOFENCE_');
  const severity = alert.severity || 'info';

  const severityColors = {
    info: {
      bg: isDark ? 'bg-blue-950/90' : 'bg-blue-50',
      border: isDark ? 'border-blue-800' : 'border-blue-200',
      icon: isDark ? 'text-blue-400' : 'text-blue-600',
      text: isDark ? 'text-blue-300' : 'text-blue-900',
      button: isDark ? 'bg-blue-800 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200 text-blue-800',
      buttonResolve: isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    },
    warning: {
      bg: isDark ? 'bg-amber-950/90' : 'bg-amber-50',
      border: isDark ? 'border-amber-800' : 'border-amber-200',
      icon: isDark ? 'text-amber-400' : 'text-amber-600',
      text: isDark ? 'text-amber-300' : 'text-amber-900',
      button: isDark ? 'bg-amber-800 hover:bg-amber-700' : 'bg-amber-100 hover:bg-amber-200 text-amber-800',
      buttonResolve: isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    },
    critical: {
      bg: isDark ? 'bg-rose-950/90' : 'bg-rose-50',
      border: isDark ? 'border-rose-800' : 'border-rose-200',
      icon: isDark ? 'text-rose-400' : 'text-rose-600',
      text: isDark ? 'text-rose-300' : 'text-rose-900',
      button: isDark ? 'bg-rose-800 hover:bg-rose-700' : 'bg-rose-100 hover:bg-rose-200 text-rose-800',
      buttonResolve: isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    },
  };

  const colors = severityColors[severity] || severityColors.info;
  const typeIcons = {
    SPEED: 'AlertTriangle',
    FUEL: 'Fuel',
    ENGINE_TEMP: 'Thermometer',
    GEOFENCE_ENTER: 'LogIn',
    GEOFENCE_EXIT: 'LogOut',
  };

  const handleAck = async () => {
    if (alert.id && typeof alert.id === 'string' && alert.id.includes('-')) {
      setAcknowledged(true);
      onAcknowledge(alert.id);
    } else if (alert.id) {
      try {
        await alertService.acknowledge(alert.id);
        setAcknowledged(true);
        onAcknowledge(alert.id);
      } catch (err) {
        console.error('Failed to acknowledge alert:', err);
      }
    } else {
      onAcknowledge(alert.id);
    }
  };

  const handleRes = async () => {
    if (alert.id && typeof alert.id === 'string' && alert.id.includes('-')) {
      setResolved(true);
      onResolve(alert.id);
    } else if (alert.id) {
      try {
        await alertService.resolve(alert.id);
        setResolved(true);
        onResolve(alert.id);
      } catch (err) {
        console.error('Failed to resolve alert:', err);
      }
    } else {
      onResolve(alert.id);
    }
  };

  const timestamp = alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : '--:--:--';

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl shadow-lg border min-w-[300px] max-w-[400px] animate-in slide-in-from-right duration-300 ${
        exiting ? 'animate-out slide-out-to-right fade-out duration-200' : ''
      } ${colors.bg} ${colors.border}`}
      role="alert"
      aria-live="polite"
    >
      <div className={`flex-shrink-0 mt-0.5 ${colors.icon}`}>
        <Icon name={typeIcons[alert.type] || 'AlertTriangle'} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${colors.text}`}>{alert.message}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{alert.licensePlate || 'N/A'}</span>
          {alert.geofenceName && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Icon name="MapPin" size={10} />
              {alert.geofenceName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={10} />
            {timestamp}
          </span>
        </div>
        {!acknowledged && !resolved && (
          <div className="flex gap-2 mt-3 pt-2 border-t border-current/20">
            <button
              onClick={handleAck}
              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${colors.button}`}
            >
              Acknowledge
            </button>
            <button
              onClick={handleRes}
              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${colors.buttonResolve}`}
            >
              Resolve
            </button>
          </div>
        )}
        {(acknowledged || resolved) && (
          <div className="mt-3 pt-2 border-t border-current/20 text-center text-xs text-slate-500 dark:text-slate-400">
            {acknowledged ? '✓ Acknowledged' : ''} {acknowledged && resolved ? '·' : ''} {resolved ? '✓ Resolved' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

const AlertFeed = ({ alerts: liveAlerts, onAcknowledge, onResolve, isDark }) => {
  const [displayedAlerts, setDisplayedAlerts] = useState([]);
  const [persistedLoaded, setPersistedLoaded] = useState(false);

  useEffect(() => {
    const loadPersisted = async () => {
      try {
        const data = await alertService.getAll({ size: 20, acknowledged: false });
        if (data?.content) {
          setDisplayedAlerts(prev => {
            const existing = new Set(prev.map(a => a.id));
            const newAlerts = data.content.filter(a => !existing.has(a.id));
            return [...newAlerts, ...prev].slice(0, 15);
          });
        }
      } catch (err) {
        console.error('Failed to load persisted alerts:', err);
      } finally {
        setPersistedLoaded(true);
      }
    };
    loadPersisted();
  }, []);

  useEffect(() => {
    const newAlerts = liveAlerts.filter((a) => !displayedAlerts.some((d) => d.id === a.id));
    if (newAlerts.length > 0) {
      setDisplayedAlerts((prev) => [...newAlerts, ...prev].slice(0, 15));
    }
  }, [liveAlerts, displayedAlerts]);

  const handleAcknowledge = useCallback(
    (id) => {
      setDisplayedAlerts((prev) => prev.filter((a) => a.id !== id));
      onAcknowledge(id);
    },
    [onAcknowledge]
  );

  const handleResolve = useCallback(
    (id) => {
      setDisplayedAlerts((prev) => prev.filter((a) => a.id !== id));
      onResolve(id);
    },
    [onResolve]
  );

  if (displayedAlerts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none"
      role="region"
      aria-label="Alert notifications"
    >
      {displayedAlerts.map((alert) => (
        <div key={alert.id} className="pointer-events-auto">
          <AlertItem
            alert={alert}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            isDark={isDark}
          />
        </div>
      ))}
    </div>
  );
};

export default AlertFeed;