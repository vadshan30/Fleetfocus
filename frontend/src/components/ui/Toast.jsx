import React, { useState, useEffect, useCallback } from 'react';
import Icon from './Icon';

const typeStyles = {
  success: {
    bg: 'bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 border border-slate-200/80 dark:border-slate-800',
    icon: 'CheckCircle2',
    iconColor: 'text-emerald-500',
  },
  warning: {
    bg: 'bg-white dark:bg-slate-900 border-l-4 border-l-amber-500 border border-slate-200/80 dark:border-slate-800',
    icon: 'AlertTriangle',
    iconColor: 'text-amber-500',
  },
  error: {
    bg: 'bg-white dark:bg-slate-900 border-l-4 border-l-rose-500 border border-slate-200/80 dark:border-slate-800',
    icon: 'XCircle',
    iconColor: 'text-rose-500',
  },
  info: {
    bg: 'bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 border border-slate-200/80 dark:border-slate-800',
    icon: 'Info',
    iconColor: 'text-blue-500',
  },
};

const Toast = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    window.addNotification = addNotification;
    return () => {
      delete window.addNotification;
    };
  }, [addNotification]);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const visibleNotifications = notifications.slice(0, 5);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {visibleNotifications.map((notif) => {
        const style = typeStyles[notif.type] || typeStyles.info;
        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg shadow-slate-950/10 transition-all duration-300 transform animate-in slide-in-from-bottom-5 ${style.bg}`}
          >
            <Icon name={style.icon} size={20} className={`shrink-0 ${style.iconColor}`} />
            <p className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-100 leading-snug">
              {notif.message}
            </p>
            <button
              onClick={() => removeNotification(notif.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
