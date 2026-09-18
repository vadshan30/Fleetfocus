import React, { useState } from 'react';

const StatusDonut = ({ vehicles = [] }) => {
  console.log('🔵 StatusDonut rendered with vehicles:', vehicles);
  console.log('🔵 Number of vehicles:', vehicles.length);

  const [hoveredSegment, setHoveredSegment] = useState(null);

  if (!vehicles || vehicles.length === 0) {
    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        margin: '25px 0',
        textAlign: 'center',
        color: '#94a3b8'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1a2a3a' }}>Vehicle Status Distribution</h3>
        <p>No vehicles available to display chart</p>
      </div>
    );
  }

  const total = vehicles.length;
  const onTrip = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const maintenance = vehicles.filter(v => v.status === 'UNDER_MAINTENANCE').length;
  const available = vehicles.filter(v => v.status === 'AVAILABLE').length;

  const onTripPct = (onTrip / total) * 100;
  const maintPct = (maintenance / total) * 100;
  const availablePct = (available / total) * 100;

  const segments = [
    { id: 'onTrip', label: 'On Trip', value: onTrip, percentage: onTripPct, color: '#2563eb', hoverColor: '#1d4ed8' },
    { id: 'maintenance', label: 'Maintenance', value: maintenance, percentage: maintPct, color: '#f59e0b', hoverColor: '#d97706' },
    { id: 'available', label: 'Available', value: available, percentage: availablePct, color: '#10b981', hoverColor: '#059669' }
  ];

  const getPercentage = (value) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const size = 200;
  const strokeWidth = 25;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;

  const getCoordinates = (percentage) => {
    const angle = (percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;
    return { startAngle, endAngle, angle };
  };

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      margin: '25px 0'
    }}>
      <h3 style={{
        marginBottom: '25px',
        color: '#1a2a3a',
        fontSize: '20px',
        fontWeight: '700'
      }}>
        Vehicle Status Distribution
      </h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '60px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          position: 'relative', 
          width: size, 
          height: size
        }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
            {segments.map((segment) => {
              const percentage = getPercentage(segment.value);
              if (percentage === 0) return null;
              
              const { startAngle, endAngle } = getCoordinates(percentage);
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);
              
              const x1 = size / 2 + radius * Math.cos(startRad);
              const y1 = size / 2 + radius * Math.sin(startRad);
              const x2 = size / 2 + radius * Math.cos(endRad);
              const y2 = size / 2 + radius * Math.sin(endRad);
              
              const largeArc = percentage > 50 ? 1 : 0;
              
              const pathData = [
                `M ${size / 2} ${size / 2}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');

              const isHovered = hoveredSegment === segment.id;

              return (
                <path
                  key={segment.id}
                  d={pathData}
                  fill={isHovered ? segment.hoverColor : segment.color}
                  stroke="white"
                  strokeWidth="3"
                  style={{
                    transition: 'fill 0.3s ease, transform 0.3s ease',
                    cursor: 'pointer',
                    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                    transformOrigin: `${size/2}px ${size/2}px`
                  }}
                  onMouseEnter={() => setHoveredSegment(segment.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              );
            })}
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#1a2a3a'
            }}>
              {total}
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#94a3b8',
              letterSpacing: '0.5px'
            }}>
              TOTAL
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '180px' }}>
          {segments.map((s) => {
            const isHovered = hoveredSegment === s.id;
            const percentage = getPercentage(s.value);
            return (
              <div 
                key={s.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: isHovered ? '#f1f5f9' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: isHovered ? `3px solid ${s.color}` : '3px solid transparent'
                }}
                onMouseEnter={() => setHoveredSegment(s.id)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: s.color,
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: isHovered ? `0 0 12px ${s.color}66` : 'none'
                }}></span>
                <span style={{ 
                  fontSize: '14px', 
                  color: isHovered ? '#1a2a3a' : '#475569',
                  fontWeight: isHovered ? '700' : '500',
                  flex: 1,
                  transition: 'all 0.3s ease'
                }}>
                  {s.label}
                </span>
                <span style={{
                  fontSize: '14px',
                  color: isHovered ? '#1a2a3a' : '#64748b',
                  fontWeight: isHovered ? '700' : '600',
                  minWidth: '30px',
                  textAlign: 'right',
                  transition: 'all 0.3s ease'
                }}>
                  {s.value}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  fontWeight: '500',
                  minWidth: '50px',
                  textAlign: 'right'
                }}>
                  ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusDonut;