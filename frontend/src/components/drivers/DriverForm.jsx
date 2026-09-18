import React, { useState, useEffect } from 'react';
import driverService from '../../services/driverService';

const DriverForm = ({ driver, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    licenseNumber: '',
    status: 'AVAILABLE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (driver) {
      setFormData({
        username: driver.user?.username || '',
        password: '',
        email: driver.user?.email || '',
        licenseNumber: driver.licenseNumber || '',
        status: driver.status || 'AVAILABLE'
      });
    }
  }, [driver]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (driver) {
        await driverService.update(driver.id, {
          licenseNumber: formData.licenseNumber,
          status: formData.status
        });
        if (window.addNotification) {
          window.addNotification('Driver updated successfully!', 'success');
        }
        onClose();
      } else {
        const result = await driverService.register(formData);
        console.log('Registration result:', result);
        if (result && result.id) {
          if (window.addNotification) {
            window.addNotification('Driver registered successfully!', 'success');
          }
          onClose();
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          setError('Driver registration failed. Please try again.');
        }
      }
    } catch (error) {
      const errorMsg = error.message || 'Error saving driver!';
      setError(errorMsg);
      if (window.addNotification) {
        window.addNotification(errorMsg, 'error');
      }
    }
    setLoading(false);
  };

  const isEdit = !!driver;
  const heading = isEdit ? 'Edit Driver' : 'Register New Driver';
  const buttonText = isEdit ? 'Update Driver' : 'Register Driver';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{heading}</h2>
        {error && (
          <div style={{
            padding: '10px 14px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid #fecaca'
          }}>
            ⚠️ {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isEdit}
          />
          {!isEdit && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isEdit}
          />
          <input
            type="text"
            name="licenseNumber"
            placeholder="License Number"
            value={formData.licenseNumber}
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
            <option value="OFF_DUTY">OFF_DUTY</option>
          </select>
          <div className="modal-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : buttonText}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverForm;