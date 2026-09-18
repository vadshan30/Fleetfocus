import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import vehicleService from '../../services/vehicleService';
import tripService from '../../services/tripService';
import maintenanceService from '../../services/maintenanceService';
import LoadingSpinner from '../common/LoadingSpinner';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vehicleData, tripsData, logsData] = await Promise.all([
          vehicleService.getById(id),
          tripService.getAll(),
          maintenanceService.getAll(),
        ]);
        setVehicle(vehicleData);
        const vehicleTrips = tripsData.filter(t => t.vehicle?.id === parseInt(id));
        setTrips(vehicleTrips);
        const vehicleLogs = logsData.filter(l => l.vehicle?.id === parseInt(id));
        setMaintenanceLogs(vehicleLogs);
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        if (error.response?.status === 404) {
          navigate('/vehicles');
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id, navigate]);

  const totalDistance = trips.reduce((sum, t) => sum + (t.distanceCovered || 0), 0);
  const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
  const avgDistance = completedTrips > 0 ? (totalDistance / completedTrips).toFixed(1) : 0;

  if (loading) {
    return <LoadingSpinner message="Loading vehicle details..." size="large" />;
  }

  if (!vehicle) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚛</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a2a3a' }}>
          Vehicle not found
        </div>
        <button 
          onClick={() => navigate('/vehicles')}
          style={{
            marginTop: '16px',
            padding: '10px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/vehicles')}
        style={{
          background: 'none',
          border: 'none',
          color: '#2563eb',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '16px'
        }}
      >
        ← Back to Vehicles
      </button>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #eef2f6',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '36px' }}>🚛</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1a2a3a' }}>
                  {vehicle.licensePlate}
                </h1>
                <div style={{ fontSize: '16px', color: '#64748b' }}>
                  {vehicle.model} • {vehicle.vin || 'N/A'}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              background: vehicle.status === 'AVAILABLE' ? '#d1fae5' :
                         vehicle.status === 'ON_TRIP' ? '#dbeafe' : '#fef3c7',
              color: vehicle.status === 'AVAILABLE' ? '#065f46' :
                     vehicle.status === 'ON_TRIP' ? '#1e40af' : '#92400e'
            }}>
              {vehicle.status || 'UNKNOWN'}
            </span>
            <span style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              background: '#f1f5f9',
              color: '#64748b'
            }}>
              📏 {vehicle.currentMileage?.toFixed(0) || 0} km
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          borderLeft: '4px solid #2563eb'
        }}>
          <div style={{ fontSize: '20px' }}>📋</div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Total Trips</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>{trips.length}</div>
        </div>
        <div style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '20px' }}>📏</div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Total Distance</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>{totalDistance.toFixed(0)} km</div>
        </div>
        <div style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ fontSize: '20px' }}>📊</div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Avg Distance</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>{avgDistance} km</div>
        </div>
        <div style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <div style={{ fontSize: '20px' }}>🔧</div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Maintenance</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a2a3a' }}>{maintenanceLogs.length}</div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => navigate('/trips')}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🚗 Start Trip
        </button>
        <button
          onClick={() => navigate('/maintenance', { state: { vehicleId: vehicle.id } })}
          style={{
            padding: '10px 20px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔧 Log Maintenance
        </button>
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #eef2f6',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1a2a3a' }}>
          📋 Trip History ({trips.length} trips)
        </h3>
        {trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
            No trips recorded for this vehicle
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Trip ID</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Driver</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Start Time</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Distance</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>
                      TRP-{trip.id}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                      {trip.driver?.user?.username || 'N/A'}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b' }}>
                      {trip.startTime ? new Date(trip.startTime).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: trip.status === 'COMPLETED' ? '#d1fae5' : '#dbeafe',
                        color: trip.status === 'COMPLETED' ? '#065f46' : '#1e40af'
                      }}>
                        {trip.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '600' }}>
                      {(trip.distanceCovered || 0).toFixed(1)} km
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #eef2f6'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1a2a3a' }}>
          🔧 Maintenance History ({maintenanceLogs.length} records)
        </h3>
        {maintenanceLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
            No maintenance records for this vehicle
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Date</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Technician</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Description</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b' }}>
                      {log.serviceDate ? new Date(log.serviceDate).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                      {log.technician?.username || 'N/A'}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                      {log.description}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '600', color: '#dc2626' }}>
                      ${(log.cost || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetails;