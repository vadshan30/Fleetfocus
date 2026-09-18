import React, { useState, useEffect } from 'react';

const NotificationStack = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    window.addNotification = addNotification;
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '✅';
    }
  };

  const getClass = (type) => {
    switch (type) {
      case 'success': return 'notification-success';
      case 'warning': return 'notification-warning';
      case 'error': return 'notification-error';
      default: return 'notification-success';
    }
  };

  const visibleNotifications = notifications.slice(0, 5);

  return (
    <div className="notification-stack">
      {visibleNotifications.map((notif) => (
        <div key={notif.id} className={`notification ${getClass(notif.type)}`} style={{
          background: 'white',
          padding: '14px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '280px',
          animation: 'slideIn 0.3s ease',
          borderLeft: `4px solid ${notif.type === 'success' ? '#10b981' : notif.type === 'warning' ? '#f59e0b' : '#ef4444'}`
        }}>
          <span className="notification-icon" style={{ fontSize: '18px' }}>{getIcon(notif.type)}</span>
          <span className="notification-message" style={{ flex: 1, fontSize: '14px', color: '#1e293b' }}>{notif.message}</span>
          <button className="notification-close" onClick={() => removeNotification(notif.id)} style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 4px'
          }}>×</button>
        </div>
      ))}
    </div>
  );
};

export default NotificationStack;