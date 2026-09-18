import React from 'react';
import { useNavigate } from 'react-router-dom';

const TripTimeline = ({ trips = [] }) => {
  const navigate = useNavigate();

  if (trips.length === 0) {
    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #eef2f6',
        textAlign: 'center',
        color: '#94a3b8'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a2a3a' }}>
          No trips yet
        </div>
        <div style={{ fontSize: '14px', marginTop: '4px' }}>
          Start a trip to see your timeline here
        </div>
      </div>
    );
  }

  const sortedTrips = [...trips].sort((a, b) => 
    new Date(b.startTime) - new Date(a.startTime)
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return '#10b981';
      case 'IN_PROGRESS': return '#2563eb';
      case 'ACTIVE': return '#2563eb';
      case 'SCHEDULED': return '#f59e0b';
      case 'CANCELLED': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'COMPLETED': return '✅';
      case 'IN_PROGRESS': return '🔄';
      case 'ACTIVE': return '🔄';
      case 'SCHEDULED': return '📅';
      case 'CANCELLED': return '❌';
      default: return '📋';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'COMPLETED': return 'Completed';
      case 'IN_PROGRESS': return 'In Progress';
      case 'ACTIVE': return 'Active';
      case 'SCHEDULED': return 'Scheduled';
      case 'CANCELLED': return 'Cancelled';
      default: return status || 'Unknown';
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      margin: '20px 0',
      border: '1px solid #eef2f6'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#ede9fe',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '20px'
          }}>
            ⏳
          </div>
          <div>
            <h3 style={{
              margin: 0,
              color: '#1a2a3a',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              Trip Timeline
            </h3>
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              marginTop: '2px'
            }}>
              {sortedTrips.length} trips • Latest first
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/trips')}
          style={{
            padding: '6px 16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '8px',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9';
          }}
        >
          View All →
        </button>
      </div>

      <div style={{ position: 'relative', paddingLeft: '28px' }}>
        {sortedTrips.slice(0, 10).map((trip, index) => {
          const isLast = index === sortedTrips.slice(0, 10).length - 1;
          const statusColor = getStatusColor(trip.status);
          const statusIcon = getStatusIcon(trip.status);
          const statusLabel = getStatusLabel(trip.status);

          return (
            <div
              key={trip.id}
              style={{
                position: 'relative',
                paddingBottom: isLast ? '0' : '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                const vehicle = trip.vehicle;
                if (vehicle) {
                  navigate(`/vehicles/${vehicle.id}`);
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {/* Timeline Line */}
              {!isLast && (
                <div style={{
                  position: 'absolute',
                  left: '-22px',
                  top: '28px',
                  bottom: '0',
                  width: '2px',
                  background: '#e2e8f0'
                }} />
              )}

              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: '-28px',
                top: '4px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: statusColor,
                border: '3px solid white',
                boxShadow: '0 0 0 2px ' + statusColor,
                zIndex: 2
              }} />

              {/* Trip Card */}
              <div style={{
                background: '#f8fafc',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{statusIcon}</span>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: '#1a2a3a',
                        fontSize: '15px'
                      }}>
                        {trip.vehicle?.licensePlate || 'N/A'}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#64748b'
                      }}>
                        {trip.vehicle?.model || 'Vehicle'} • {trip.driver?.user?.username || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      padding: '2px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: statusColor + '20',
                      color: statusColor
                    }}>
                      {statusLabel}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1a2a3a'
                    }}>
                      {(trip.distanceCovered || 0).toFixed(1)} km
                    </span>
                  </div>
                </div>

                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  gap: '16px',
                  fontSize: '12px',
                  color: '#94a3b8',
                  flexWrap: 'wrap'
                }}>
                  <span>
                    🕐 {trip.startTime ? new Date(trip.startTime).toLocaleString() : 'N/A'}
                  </span>
                  {trip.endTime && (
                    <span>
                      🏁 {new Date(trip.endTime).toLocaleString()}
                    </span>
                  )}
                  <span>
                    📋 TRP-{trip.id}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                    Click to view vehicle
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {sortedTrips.length > 10 && (
          <div style={{
            textAlign: 'center',
            padding: '12px 0 0 0',
            fontSize: '13px',
            color: '#94a3b8'
          }}>
            + {sortedTrips.length - 10} more trips
            <button
              onClick={() => navigate('/trips')}
              style={{
                marginLeft: '8px',
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              View all →
            </button>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '16px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        fontSize: '12px',
        color: '#94a3b8',
        paddingTop: '12px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981'
          }} /> Completed
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#2563eb'
          }} /> In Progress
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#f59e0b'
          }} /> Scheduled
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#ef4444'
          }} /> Cancelled
        </span>
      </div>
    </div>
  );
};

export default TripTimeline;