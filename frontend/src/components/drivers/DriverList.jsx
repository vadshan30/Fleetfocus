import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import driverService from '../../services/driverService';
import DriverForm from './DriverForm';
import { exportToCSV } from '../../utils/exportUtils';
import '../../VehicleList.css';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useSelector((state) => state.auth.user);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAdd = () => {
    setSelectedDriver(null);
    setShowModal(true);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await driverService.delete(id);
        if (window.addNotification) {
          window.addNotification('Driver deleted successfully!', 'success');
        }
        fetchDrivers();
      } catch (error) {
        if (window.addNotification) {
          window.addNotification('Error deleting driver!', 'error');
        }
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredDrivers.map(d => ({
      Username: d.user?.username || 'N/A',
      Email: d.user?.email || 'N/A',
      'License Number': d.licenseNumber || 'N/A',
      Status: d.status || 'N/A'
    }));
    exportToCSV(exportData, 'drivers');
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedDriver(null);
    fetchDrivers();
  };

  const filteredDrivers = drivers.filter(d =>
    d.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = drivers.length;
  const available = drivers.filter(d => d.status === 'AVAILABLE').length;
  const onTrip = drivers.filter(d => d.status === 'ON_TRIP').length;
  const offDuty = drivers.filter(d => d.status === 'OFF_DUTY').length;

  if (loading && drivers.length === 0) {
    return (
      <div className="vl-page">
        <div className="vl-loading">
          <div className="vl-spinner" />
          <div className="vl-loading-text">Loading Drivers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="vl-page">
      {/* HEADER */}
      <div className="vl-header">
        <div className="vl-header-left">
          <h1>Driver Management</h1>
          <p>Manage all your fleet drivers in one place</p>
        </div>
        <div className="vl-header-actions">
          <button className="vl-btn-export" onClick={handleExport}>
            📥 Export CSV
          </button>
          {user && user.role === 'FLEET_MANAGER' && (
            <button className="vl-btn-add" onClick={handleAdd}>
              + Add Driver
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="vl-stats">
        <div className="vl-stat">
          <div className="vl-stat-icon" style={{ background: '#eff6ff', color: '#2b5ce6' }}>👤</div>
          <div>
            <div className="vl-stat-value">{total}</div>
            <div className="vl-stat-label">Total Drivers</div>
          </div>
        </div>
        <div className="vl-stat">
          <div className="vl-stat-icon" style={{ background: '#ecfdf5', color: '#16a34a' }}>✅</div>
          <div>
            <div className="vl-stat-value">{available}</div>
            <div className="vl-stat-label">Available</div>
          </div>
        </div>
        <div className="vl-stat">
          <div className="vl-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>📍</div>
          <div>
            <div className="vl-stat-value">{onTrip}</div>
            <div className="vl-stat-label">On Trip</div>
          </div>
        </div>
        <div className="vl-stat">
          <div className="vl-stat-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>💤</div>
          <div>
            <div className="vl-stat-value">{offDuty}</div>
            <div className="vl-stat-label">Off Duty</div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="vl-search-wrap">
        <span className="vl-search-icon">🔍</span>
        <input
          type="text"
          className="vl-search"
          placeholder="Search by Username, Email, License Number or Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="vl-search-clear" onClick={() => setSearchTerm('')}>
            Clear
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="vl-search-result">
          Found <strong>{filteredDrivers.length}</strong> driver{filteredDrivers.length !== 1 ? 's' : ''} matching "{searchTerm}"
        </div>
      )}

      {/* TABLE */}
      <div className="vl-table-card">
        <table className="vl-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>License Number</th>
              <th>Status</th>
              {user && user.role === 'FLEET_MANAGER' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={user && user.role === 'FLEET_MANAGER' ? 5 : 4} style={{ padding: 0 }}>
                  <div className="vl-empty">
                    <div className="vl-empty-icon">👤</div>
                    <div className="vl-empty-title">
                      {searchTerm ? 'No drivers match your search' : 'No drivers available'}
                    </div>
                    <div className="vl-empty-text">
                      {searchTerm ? 'Try a different search term' : 'Add your first driver to get started'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="vl-cell-plate">{driver.user?.username || 'N/A'}</td>
                  <td className="vl-cell-model">{driver.user?.email || 'N/A'}</td>
                  <td className="vl-cell-vin">{driver.licenseNumber || 'N/A'}</td>
                  <td>
                    <span className={`vl-status ${driver.status?.toLowerCase()}`}>
                      {driver.status || 'UNKNOWN'}
                    </span>
                  </td>
                  {user && user.role === 'FLEET_MANAGER' && (
                    <td>
                      <div className="vl-actions">
                        <button
                          className="vl-btn-action vl-btn-edit"
                          onClick={() => handleEdit(driver)}
                        >
                          <span>✎</span> Edit
                        </button>
                        <button
                          className="vl-btn-action vl-btn-delete"
                          onClick={() => handleDelete(driver.id)}
                        >
                          <span>✕</span> Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DriverForm driver={selectedDriver} onClose={handleClose} />
      )}
    </div>
  );
};

export default DriverList;