import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../ui/Icon';

const AlertItem = ({ alert, onAcknowledge, isDark }) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => setVisible(false), 200);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const severityColors = {
    warning: {
      bg: isDark ? 'bg-amber-950/90' : 'bg-amber-50',
      border: isDark ? 'border-amber-800' : 'border-amber-200',
      icon: isDark ? 'text-amber-400' : 'text-amber-600',
      text: isDark ? 'text-amber-300' : 'text-amber-900',
      button: isDark ? 'bg-amber-800 hover:bg-amber-700' : 'bg-amber-100 hover:bg-amber-200 text-amber-800',
    },
    critical: {
      bg: isDark ? 'bg-rose-950/90' : 'bg-rose-50',
      border: isDark ? 'border-rose-800' : 'border-rose-200',
      icon: isDark ? 'text-rose-400' : 'text-rose-600',
      text: isDark ? 'text-rose-300' : 'text-rose-900',
      button: isDark ? 'bg-rose-800 hover:bg-rose-700' : 'bg-rose-100 hover:bg-rose-200 text-rose-800',
    },
  };

  const colors = severityColors[alert.severity] || severityColors.warning;
  const typeIcons = {
    SPEED: 'AlertTriangle',
    FUEL: 'Fuel',
    ENGINE_TEMP: 'Thermometer',
  };

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
          <button
            onClick={() => onAcknowledge(alert.id)}
            className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium transition-colors ${colors.button}`}
            aria-label="Acknowledge alert"
          >
            Acknowledge
          </button>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{alert.licensePlate}</span>
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={10} />
            {new Date(alert.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const AlertFeed = ({ alerts, onAcknowledge, isDark }) => {
  const [displayedAlerts, setDisplayedAlerts] = useState([]);

  useEffect(() => {
    const newAlerts = alerts.filter((a) => !displayedAlerts.some((d) => d.id === a.id));
    if (newAlerts.length > 0) {
      setDisplayedAlerts((prev) => [...newAlerts, ...prev].slice(0, 10));
    }
  }, [alerts, displayedAlerts]);

  const handleAcknowledge = useCallback(
    (id) => {
      setDisplayedAlerts((prev) => prev.filter((a) => a.id !== id));
      onAcknowledge(id);
    },
    [onAcknowledge]
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
          <AlertItem alert={alert} onAcknowledge={handleAcknowledge} isDark={isDark} />
        </div>
      ))}
    </div>
  );
};

export default AlertFeed;