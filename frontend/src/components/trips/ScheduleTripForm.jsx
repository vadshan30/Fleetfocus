import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import tripService from '../../services/tripService';

const ScheduleTripForm = ({ onClose }) => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, driversData] = await Promise.all([
          vehicleService.getAvailable(),
          driverService.getAvailable(),
        ]);
        setVehicles(vehiclesData || []);
        setDrivers(driversData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();

    const defaultTime = new Date(Date.now() + 3600000);
    setScheduledTime(defaultTime.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehicleId || !driverId || !scheduledTime) {
      if (window.addNotification) {
        window.addNotification('Please fill all fields!', 'warning');
      }
      return;
    }

    const selectedTime = new Date(scheduledTime);
    const now = new Date();

    if (selectedTime < now) {
      if (window.addNotification) {
        window.addNotification('Cannot schedule a trip in the past! Please select a future time.', 'warning');
      }
      return;
    }

    setSubmitting(true);
    try {
      const formattedTime = new Date(scheduledTime).toISOString().slice(0, 19);

      await tripService.schedule({
        vehicleId: parseInt(vehicleId),
        driverId: parseInt(driverId),
        scheduledTime: formattedTime
      });

      if (window.addNotification) {
        window.addNotification('Trip scheduled successfully!', 'success');
      }
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error scheduling trip!';
      if (window.addNotification) {
        window.addNotification(errorMsg, 'error');
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>📅 Schedule Trip</h2>
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>📅 Schedule Trip</h2>
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

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{
            padding: '12px 16px',
            background: '#fef3c7',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#92400e'
          }}>
            ⏰ Vehicle and driver will be reserved for this time
          </div>

          <div className="modal-actions">
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                background: '#f59e0b',
                color: 'white',
                transition: 'background 0.3s ease',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Scheduling...' : '📅 Schedule Trip'}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleTripForm;