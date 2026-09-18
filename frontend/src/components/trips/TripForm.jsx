import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import tripService from '../../services/tripService';

const TripForm = ({ onClose }) => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vehiclesData, driversData] = await Promise.all([
          vehicleService.getAvailable(),
          driverService.getAvailable(),
        ]);
        setVehicles(vehiclesData || []);
        setDrivers(driversData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId || !driverId) {
      if (window.addNotification) {
        window.addNotification('Please select both a vehicle and a driver.', 'warning');
      }
      return;
    }
    try {
      await tripService.start({
        vehicleId: parseInt(vehicleId),
        driverId: parseInt(driverId),
      });
      if (window.addNotification) {
        window.addNotification('Trip started successfully!', 'success');
      }
      onClose();
    } catch (error) {
      if (window.addNotification) {
        window.addNotification('Error starting trip!', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Dispatch Vehicle</h2>
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
            Loading available vehicles and drivers...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Dispatch Vehicle</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
              Select Vehicle
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="">Select a vehicle</option>
              {vehicles.length === 0 ? (
                <option value="" disabled>No vehicles available</option>
              ) : (
                vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.licensePlate}) - {v.status}
                  </option>
                ))
              )}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
              Select Driver
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="">Select a driver</option>
              {drivers.length === 0 ? (
                <option value="" disabled>No drivers available</option>
              ) : (
                drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.user?.username || 'Unknown Driver'} - {d.status || 'AVAILABLE'}
                  </option>
                ))
              )}
            </select>
          </div>

          <div style={{ 
            padding: '12px 16px', 
            background: '#f8fafc', 
            borderRadius: '8px', 
            marginBottom: '16px',
            fontSize: '13px',
            color: '#64748b'
          }}>
            <div>Available Vehicles: <strong>{vehicles.length}</strong></div>
            <div>Available Drivers: <strong>{drivers.length}</strong></div>
          </div>

          <div className="modal-actions">
            <button type="submit" disabled={!vehicleId || !driverId} style={{
              padding: '10px 28px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              background: (!vehicleId || !driverId) ? '#94a3b8' : '#2563eb',
              color: 'white',
              transition: 'background 0.3s ease'
            }}>
              Start Trip
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripForm;