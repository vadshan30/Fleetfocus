import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import maintenanceService from '../../services/maintenanceService';
import tripService from '../../services/tripService';

const MaintenanceReminder = ({ vehicles = [] }) => {
  const navigate = useNavigate();
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [trips, setTrips] = useState([]);
  const serviceInterval = 5000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, tripsData] = await Promise.all([
          maintenanceService.getAll(),
          tripService.getAll(),
        ]);
        setMaintenanceLogs(logsData || []);
        setTrips(tripsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getVehicleTotalTripDistance = (vehicleId) => {
    return trips
      .filter(t => t.vehicle?.id === vehicleId && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + (t.distanceCovered || 0), 0);
  };

  const vehiclesWithMaintenance = vehicles.map(vehicle => {
    const logs = maintenanceLogs.filter(log => log.vehicle?.id === vehicle.id);
    const totalTripDistance = getVehicleTotalTripDistance(vehicle.id);
    
    // Total mileage = vehicle current mileage + trip distances
    const currentMileage = (vehicle.currentMileage || 0) + totalTripDistance;
    const serviceCount = logs.length;
    
    // Calculate next service based on mileage
    const nextServiceMileage = serviceCount > 0 
      ? Math.floor((currentMileage / serviceInterval) + 1) * serviceInterval
      : serviceInterval;
    
    const kmUntilService = Math.max(0, nextServiceMileage - currentMileage);
    const isDue = kmUntilService < 500;
    const isOverdue = kmUntilService === 0 || currentMileage >= nextServiceMileage;

    return {
      ...vehicle,
      currentMileage,
      nextServiceMileage,
      kmUntilService,
      isDue,
      isOverdue,
      serviceCount,
      totalTripDistance
    };
  });

  const dueVehicles = vehiclesWithMaintenance.filter(v => v.isDue || v.isOverdue);
  const sortedByUrgency = [...dueVehicles].sort((a, b) => a.kmUntilService - b.kmUntilService);

  const handleCardClick = (vehicleId) => {
    navigate('/maintenance', { state: { vehicleId } });
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
            background: '#fee2e2',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '20px'
          }}>
            🔔
          </div>
          <div>
            <h3 style={{
              margin: 0,
              color: '#1a2a3a',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              Maintenance Reminders
            </h3>
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              marginTop: '2px'
            }}>
              {dueVehicles.length > 0 
                ? `${dueVehicles.length} vehicle${dueVehicles.length > 1 ? 's' : ''} due for service`
                : 'All vehicles are up to date'
              }
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#64748b',
            background: '#f1f5f9',
            padding: '4px 14px',
            borderRadius: '20px'
          }}>
            ⏱️ Service every {serviceInterval} km
          </span>
          <button
            onClick={async () => {
              try {
                const [logsData, tripsData] = await Promise.all([
                  maintenanceService.getAll(),
                  tripService.getAll(),
                ]);
                setMaintenanceLogs(logsData || []);
                setTrips(tripsData || []);
                if (window.addNotification) {
                  window.addNotification('Refreshed maintenance data!', 'success');
                }
              } catch (error) {
                console.error('Error refreshing:', error);
              }
            }}
            style={{
              background: '#2563eb',
              border: 'none',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '2px dashed #e2e8f0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔧</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a2a3a' }}>
            No vehicles registered
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Add vehicles to track maintenance schedules
          </div>
        </div>
      ) : sortedByUrgency.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '30px 20px',
          background: '#d1fae5',
          borderRadius: '12px',
          border: '2px solid #10b981'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#065f46' }}>
            All vehicles are up to date!
          </div>
          <div style={{ fontSize: '13px', color: '#047857', marginTop: '4px' }}>
            No maintenance reminders at this time
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedByUrgency.map((vehicle) => (
            <div 
              key={vehicle.id} 
              onClick={() => handleCardClick(vehicle.id)}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                background: vehicle.isOverdue ? '#fee2e2' : 
                           vehicle.isDue ? '#fef3c7' : 'white',
                border: vehicle.isOverdue ? '2px solid #dc2626' :
                       vehicle.isDue ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>
                    {vehicle.isOverdue ? '🚨' : vehicle.isDue ? '⚠️' : '✅'}
                  </span>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1a2a3a'
                    }}>
                      {vehicle.licensePlate}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b'
                    }}>
                      {vehicle.model} • {vehicle.currentMileage.toFixed(0)} km
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
                    fontSize: '12px',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    background: vehicle.isOverdue ? '#dc2626' : 
                               vehicle.isDue ? '#f59e0b' : '#10b981',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    {vehicle.isOverdue ? 'OVERDUE' : 
                     vehicle.isDue ? 'DUE SOON' : 'OK'}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    color: '#475569'
                  }}>
                    {vehicle.isOverdue ? 'Service overdue!' :
                     vehicle.isDue ? `${vehicle.kmUntilService.toFixed(0)} km remaining` :
                     `${vehicle.kmUntilService.toFixed(0)} km until service`}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    {vehicle.serviceCount} services • {vehicle.totalTripDistance.toFixed(0)} km on trips
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
        <span>🔧 Service interval: {serviceInterval} km</span>
        <span>📊 {vehicles.length} vehicles tracked</span>
        <span>🔄 Auto-refreshes every 30s</span>
        <span>📋 Based on trips + mileage</span>
      </div>
    </div>
  );
};

export default MaintenanceReminder;