import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';

const VehicleForm = ({ vehicle, onClose }) => {
  const [formData, setFormData] = useState({
    vin: '',
    licensePlate: '',
    model: '',
    status: 'AVAILABLE',
    currentMileage: 0,
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vin: vehicle.vin || '',
        licensePlate: vehicle.licensePlate || '',
        model: vehicle.model || '',
        status: vehicle.status || 'AVAILABLE',
        currentMileage: vehicle.currentMileage || 0,
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'currentMileage' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (vehicle) {
        await vehicleService.update(vehicle.id, formData);
        if (window.addNotification) {
          window.addNotification('Vehicle updated successfully!', 'success');
        }
      } else {
        await vehicleService.create(formData);
        if (window.addNotification) {
          window.addNotification('Vehicle created successfully!', 'success');
        }
      }
      onClose();
    } catch (error) {
      if (window.addNotification) {
        window.addNotification('Error saving vehicle!', 'error');
      }
    }
  };

  const isEdit = !!vehicle;
  const heading = isEdit ? 'Edit Vehicle' : 'Register New Vehicle';
  const buttonText = isEdit ? 'Update Vehicle' : 'Register Vehicle';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{heading}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="vin"
            placeholder="17-character VIN"
            maxLength="17"
            value={formData.vin}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="licensePlate"
            placeholder="e.g. ABC-1234"
            value={formData.licensePlate}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="model"
            placeholder="e.g. Volvo FH16"
            value={formData.model}
            onChange={handleChange}
            required
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ON_TRIP">ON_TRIP</option>
            <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
          </select>
          <input
            type="number"
            name="currentMileage"
            placeholder="Current Mileage"
            value={formData.currentMileage}
            onChange={handleChange}
            step="0.1"
          />
          <div className="modal-actions">
            <button type="submit">{buttonText}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;