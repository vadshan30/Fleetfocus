import React from 'react';

const StatCards = ({ vehicles = [] }) => {
  const total = vehicles.length;
  const onTrip = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const maintenance = vehicles.filter(v => v.status === 'UNDER_MAINTENANCE').length;
  const available = vehicles.filter(v => v.status === 'AVAILABLE').length;

  const stats = [
    { 
      label: 'Total Fleet', 
      value: total, 
      color: '#2563eb', 
      bgColor: '#eff6ff',
      icon: '🚛',
      subtext: 'Vehicles'
    },
    { 
      label: 'On Trip', 
      value: onTrip, 
      color: '#10b981', 
      bgColor: '#ecfdf5',
      icon: '📍',
      subtext: 'Active'
    },
    { 
      label: 'Maintenance', 
      value: maintenance, 
      color: '#f59e0b', 
      bgColor: '#fffbeb',
      icon: '🔧',
      subtext: 'Service'
    },
    { 
      label: 'Available', 
      value: available, 
      color: '#6366f1', 
      bgColor: '#eef2ff',
      icon: '✅',
      subtext: 'Ready'
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      margin: '25px 0'
    }}>
      {stats.map((stat, index) => (
        <div
          key={index}
          style={{
            background: 'white',
            padding: '20px 24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderLeft: `4px solid ${stat.color}`,
            transition: 'all 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                color: '#64748b',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px'
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1a2a3a',
                lineHeight: '1.2'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#94a3b8',
                fontWeight: '500',
                marginTop: '2px'
              }}>
                {stat.subtext}
              </div>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: stat.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
              marginLeft: '12px'
            }}>
              {stat.icon}
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '3px',
            background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)`,
            borderRadius: '0 0 12px 12px'
          }} />
        </div>
      ))}
    </div>
  );
};

export default StatCards;