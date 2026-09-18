import React from 'react';
import { useNavigate } from 'react-router-dom';

const TripCostAnalysis = ({ trips = [], vehicles = [], maintenanceLogs = [] }) => {
  const navigate = useNavigate();
  const fuelPricePerLiter = 1.80;
  const avgFuelConsumption = 8.5;

  const tripsWithCost = trips.filter(t => t.status === 'COMPLETED').map(trip => {
    const distance = trip.distanceCovered || 0;
    const fuelUsed = (distance / 100) * avgFuelConsumption;
    const fuelCost = fuelUsed * fuelPricePerLiter;
    
    const vehicleLogs = maintenanceLogs.filter(l => l.vehicle?.id === trip.vehicle?.id);
    const totalMaintenanceCost = vehicleLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
    const avgMaintenancePerTrip = vehicleLogs.length > 0 ? totalMaintenanceCost / vehicleLogs.length : 0;
    
    const totalCost = fuelCost + avgMaintenancePerTrip;
    const estimatedRevenue = distance * 2.5; // $2.5 per km revenue
    const profit = estimatedRevenue - totalCost;
    
    return {
      ...trip,
      fuelCost,
      maintenanceCost: avgMaintenancePerTrip,
      totalCost,
      estimatedRevenue,
      profit,
      profitMargin: totalCost > 0 ? (profit / estimatedRevenue) * 100 : 0
    };
  });

  const totalTrips = tripsWithCost.length;
  const totalDistance = tripsWithCost.reduce((sum, t) => sum + (t.distanceCovered || 0), 0);
  const totalFuelCost = tripsWithCost.reduce((sum, t) => sum + t.fuelCost, 0);
  const totalMaintenanceCost = tripsWithCost.reduce((sum, t) => sum + t.maintenanceCost, 0);
  const totalRevenue = tripsWithCost.reduce((sum, t) => sum + t.estimatedRevenue, 0);
  const totalProfit = tripsWithCost.reduce((sum, t) => sum + t.profit, 0);
  const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const vehicleProfitability = {};
  tripsWithCost.forEach(t => {
    const plate = t.vehicle?.licensePlate;
    if (plate) {
      if (!vehicleProfitability[plate]) {
        vehicleProfitability[plate] = { trips: 0, profit: 0, revenue: 0, distance: 0 };
      }
      vehicleProfitability[plate].trips += 1;
      vehicleProfitability[plate].profit += t.profit;
      vehicleProfitability[plate].revenue += t.estimatedRevenue;
      vehicleProfitability[plate].distance += t.distanceCovered || 0;
    }
  });

  const sortedVehicles = Object.keys(vehicleProfitability)
    .sort((a, b) => vehicleProfitability[b].profit - vehicleProfitability[a].profit);

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `$${totalRevenue.toFixed(2)}`, 
      icon: '💰', 
      color: '#10b981',
      subtext: `${totalTrips} trips`
    },
    { 
      label: 'Total Profit', 
      value: `$${totalProfit.toFixed(2)}`, 
      icon: '📈', 
      color: totalProfit >= 0 ? '#2563eb' : '#ef4444',
      subtext: `${avgProfitMargin.toFixed(1)}% margin`
    },
    { 
      label: 'Fuel Cost', 
      value: `$${totalFuelCost.toFixed(2)}`, 
      icon: '⛽', 
      color: '#f59e0b',
      subtext: `${(totalFuelCost / (totalDistance || 1) * 100).toFixed(2)}¢/km`
    },
    { 
      label: 'Maintenance Cost', 
      value: `$${totalMaintenanceCost.toFixed(2)}`, 
      icon: '🔧', 
      color: '#8b5cf6',
      subtext: `${(totalMaintenanceCost / (totalTrips || 1)).toFixed(2)}/trip`
    },
  ];

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
            background: '#dbeafe',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '20px'
          }}>
            📊
          </div>
          <div>
            <h3 style={{
              margin: 0,
              color: '#1a2a3a',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              Trip Cost & Profitability
            </h3>
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              marginTop: '2px'
            }}>
              {totalTrips > 0 ? `${totalTrips} trips analyzed` : 'Complete trips to see analysis'}
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
          📅 Revenue: $2.50/km
        </div>
      </div>

      {totalTrips === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '2px dashed #e2e8f0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a2a3a' }}>
            No completed trips yet
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Complete trips to see cost and profitability analysis
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
            {stats.map((stat, i) => (
              <div key={i} style={{
                background: '#f8fafc',
                padding: '16px 20px',
                borderRadius: '12px',
                borderLeft: `4px solid ${stat.color}`
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1a2a3a',
                  marginTop: '2px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginTop: '2px'
                }}>
                  {stat.subtext}
                </div>
              </div>
            ))}
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
              🏆 Vehicle Profitability Ranking
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '400', marginLeft: '8px' }}>
                Click a vehicle to view details
              </span>
            </h4>
            {sortedVehicles.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0' }}>
                No vehicle data available
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sortedVehicles.map((plate, i) => {
                  const rank = i + 1;
                  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
                  const data = vehicleProfitability[plate];
                  const vehicle = vehicles.find(v => v.licensePlate === plate);
                  const isProfitable = data.profit > 0;
                  
                  return (
                    <div
                      key={plate}
                      onClick={() => {
                        if (vehicle) navigate(`/vehicles/${vehicle.id}`);
                      }}
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
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = rank <= 3 ? 'white' : 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '18px', minWidth: '30px' }}>{medal}</span>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1a2a3a' }}>
                            {plate}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {vehicle?.model || 'Vehicle'} • {data.trips} trips
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: isProfitable ? '#10b981' : '#ef4444'
                        }}>
                          {isProfitable ? '+' : ''}{data.profit.toFixed(2)}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          ${data.revenue.toFixed(0)}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 12px',
                          borderRadius: '12px',
                          background: isProfitable ? '#d1fae5' : '#fee2e2',
                          color: isProfitable ? '#065f46' : '#dc2626',
                          fontWeight: '600'
                        }}>
                          {isProfitable ? 'Profitable' : 'Loss'}
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
        <span>📊 Revenue rate: $2.50/km</span>
        <span>⛽ Fuel: ${fuelPricePerLiter}/L</span>
        <span>🔧 Avg maintenance: ${(totalMaintenanceCost / (totalTrips || 1)).toFixed(2)}/trip</span>
      </div>
    </div>
  );
};

export default TripCostAnalysis;