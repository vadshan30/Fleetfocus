import React from 'react';
import { useNavigate } from 'react-router-dom';

const FuelAnalytics = ({ vehicles = [], trips = [] }) => {
  const navigate = useNavigate();

  const totalTripDistance = trips.reduce((sum, t) => {
    const distance = t.distanceCovered || 0;
    return sum + distance;
  }, 0);

  const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
  const totalTrips = trips.length;
  const inProgressTrips = trips.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE').length;

  const avgFuelConsumption = 8.5;
  const estimatedFuelUsed = (totalTripDistance / 100) * avgFuelConsumption;
  const estimatedFuelCost = estimatedFuelUsed * 1.8;

  const tripCounts = {};
  const vehicleDistances = {};

  trips.forEach(t => {
    const plate = t.vehicle?.licensePlate;
    if (plate) {
      tripCounts[plate] = (tripCounts[plate] || 0) + 1;
      vehicleDistances[plate] = (vehicleDistances[plate] || 0) + (t.distanceCovered || 0);
    }
  });

  // Check if there's any trip data
  const hasData = totalTrips > 0;

  const handleVehicleClick = (plate) => {
    const vehicle = vehicles.find(v => v.licensePlate === plate);
    if (vehicle) {
      navigate(`/vehicles/${vehicle.id}`);
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
            background: '#fef3c7',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '20px'
          }}>
            ⛽
          </div>
          <div>
            <h3 style={{
              margin: 0,
              color: '#1a2a3a',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              Fuel & Efficiency Analytics
            </h3>
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              marginTop: '2px'
            }}>
              {hasData ? `${totalTrips} trips completed` : 'No trips yet'}
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#94a3b8',
          background: '#f1f5f9',
          padding: '4px 14px',
          borderRadius: '20px'
        }}>
          📅 {totalTrips > 0 ? `${totalTrips} trips` : 'No trips'}
        </div>
      </div>

      {!hasData ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '2px dashed #e2e8f0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚛</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a2a3a' }}>
            No trip data available
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Complete a trip to see fuel consumption analytics
          </div>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: '#f8fafc',
              padding: '16px 20px',
              borderRadius: '12px',
              borderLeft: '4px solid #2563eb'
            }}>
              <div style={{ fontSize: '20px' }}>📏</div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Total Distance</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>
                {totalTripDistance > 0 ? `${totalTripDistance.toFixed(0)} km` : '0 km'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>From {completedTrips} trips</div>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '16px 20px',
              borderRadius: '12px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{ fontSize: '20px' }}>⛽</div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Est. Fuel Used</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>
                {estimatedFuelUsed > 0 ? `${estimatedFuelUsed.toFixed(1)} L` : '0 L'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>8.5 L/100km avg</div>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '16px 20px',
              borderRadius: '12px',
              borderLeft: '4px solid #10b981'
            }}>
              <div style={{ fontSize: '20px' }}>💰</div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Est. Fuel Cost</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>
                {estimatedFuelCost > 0 ? `$${estimatedFuelCost.toFixed(2)}` : '$0.00'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>$1.80/L</div>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '16px 20px',
              borderRadius: '12px',
              borderLeft: '4px solid #8b5cf6'
            }}>
              <div style={{ fontSize: '20px' }}>📋</div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Trips</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>
                {totalTrips}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {completedTrips} completed • {inProgressTrips} active
              </div>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              color: '#1a2a3a',
              fontWeight: '600'
            }}>
              🏆 Vehicle Trip Ranking
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '400', marginLeft: '8px' }}>
                Click a vehicle to view details
              </span>
            </h4>
            {Object.keys(tripCounts).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0' }}>
                No trip data available
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.keys(tripCounts)
                  .sort((a, b) => tripCounts[b] - tripCounts[a])
                  .map((plate, i) => {
                    const rank = i + 1;
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
                    const count = tripCounts[plate];
                    const distance = vehicleDistances[plate] || 0;
                    const vehicle = vehicles.find(v => v.licensePlate === plate);
                    return (
                      <div
                        key={plate}
                        onClick={() => handleVehicleClick(plate)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: rank <= 3 ? 'white' : 'transparent',
                          borderRadius: '10px',
                          border: rank <= 3 ? '1px solid #e2e8f0' : '1px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.transform = 'translateX(6px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = rank <= 3 ? 'white' : 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '18px', minWidth: '30px' }}>{medal}</span>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1a2a3a' }}>
                              {plate}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {vehicle?.model || 'Vehicle'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{
                            fontSize: '12px',
                            color: '#64748b'
                          }}>
                            {count} trip{count !== 1 ? 's' : ''}
                          </span>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#1a2a3a'
                          }}>
                            {distance.toFixed(0)} km
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 12px',
                            borderRadius: '12px',
                            background: rank === 1 ? '#d1fae5' : rank === 2 ? '#dbeafe' : '#f1f5f9',
                            color: rank === 1 ? '#065f46' : rank === 2 ? '#1e40af' : '#64748b',
                            fontWeight: '600'
                          }}>
                            {rank === 1 ? 'Most Active' : rank === 2 ? 'Active' : 'Average'}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            → Click
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      )}

      <div style={{
        marginTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        <span>⛽ {hasData ? `Based on ${totalTrips} trips` : 'Waiting for trip data'}</span>
        <span>📊 Fuel price: $1.80/L (est.)</span>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          💡 Click any vehicle to see details
        </span>
      </div>
    </div>
  );
};

export default FuelAnalytics;