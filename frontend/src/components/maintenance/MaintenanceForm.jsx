import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import userService from '../../services/userService';
import maintenanceService from '../../services/maintenanceService';

const MaintenanceForm = ({ onClose, preselectedVehicleId }) => {
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    vehicleId: preselectedVehicleId || '',
    technicianId: '',
    description: '',
    cost: 0,
    serviceDate: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, techsData] = await Promise.all([
          vehicleService.getAll(0, 100),
          userService.getTechnicians(),
        ]);
        setVehicles(vehiclesData?.content || []);
        setTechnicians(techsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.technicianId) {
      if (window.addNotification) {
        window.addNotification('Please select both vehicle and technician!', 'warning');
      }
      return;
    }
    try {
      await maintenanceService.log({
        vehicle: { id: parseInt(formData.vehicleId) },
        technician: { id: parseInt(formData.technicianId) },
        description: formData.description,
        cost: formData.cost,
        serviceDate: formData.serviceDate,
      });
      if (window.addNotification) {
        window.addNotification('Maintenance logged successfully!', 'success');
      }
      onClose();
    } catch (error) {
      if (window.addNotification) {
        window.addNotification('Error logging maintenance!', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Log Maintenance</h2>
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
        <h2>Log Maintenance</h2>
        {preselectedVehicleId && (
          <div style={{
            padding: '10px 14px',
            background: '#dbeafe',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#1e40af'
          }}>
            🔔 Logging maintenance for: <strong>
              {vehicles.find(v => v.id === parseInt(preselectedVehicleId))?.licensePlate || 'Selected Vehicle'}
            </strong>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            required
            style={{
              borderColor: preselectedVehicleId ? '#2563eb' : '#e2e8f0',
              background: preselectedVehicleId ? '#eff6ff' : 'white'
            }}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.licensePlate} - {v.model} ({v.currentMileage?.toFixed(0) || 0} km)
              </option>
            ))}
          </select>

          <select
            name="technicianId"
            value={formData.technicianId}
            onChange={handleChange}
            required
          >
            <option value="">Select Technician</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.username}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="description"
            placeholder="Service Description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="cost"
            placeholder="Cost"
            value={formData.cost}
            onChange={handleChange}
            step="0.01"
            required
          />

          <input
            type="datetime-local"
            name="serviceDate"
            value={formData.serviceDate}
            onChange={handleChange}
            required
          />

          <div className="modal-actions">
            <button type="submit">Log Maintenance</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;