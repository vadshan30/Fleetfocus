import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../../store/slices/vehicleSlice';
import VehicleForm from './VehicleForm';
import vehicleService from '../../services/vehicleService';
import { exportToCSV } from '../../utils/exportUtils';
import '../../VehicleList.css';

const VehicleList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector((state) => state.vehicles);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchVehicles({ page: currentPage, size: 10 }));
  }, [dispatch, currentPage]);

  const handleAdd = () => {
    setSelectedVehicle(null);
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.delete(id);
        if (window.addNotification) {
          window.addNotification('Vehicle deleted successfully!', 'success');
        }
        dispatch(fetchVehicles({ page: currentPage, size: 10 }));
      } catch (error) {
        if (window.addNotification) {
          window.addNotification('Error deleting vehicle!', 'error');
        }
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredItems.map(v => ({
      VIN: v.vin,
      'License Plate': v.licensePlate,
      Model: v.model,
      Status: v.status,
      Mileage: v.currentMileage || 0
    }));
    exportToCSV(exportData, 'vehicles');
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedVehicle(null);
    dispatch(fetchVehicles({ page: currentPage, size: 10 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredItems = items.filter(item =>
    item.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = items.length;
  const available = items.filter(v => v.status === 'AVAILABLE').length;
  const onTrip = items.filter(v => v.status === 'ON_TRIP').length;
  const maintenance = items.filter(v => v.status === 'UNDER_MAINTENANCE').length;

  if (loading && items.length === 0) {
    return (
      <div className="vl-page">
        <div className="vl-loading">
          <div className="vl-spinner" />
          <div className="vl-loading-text">Loading Fleet Assets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="vl-page">
      {/* HEADER */}
      <div className="vl-header">
        <div className="vl-header-left">
          <h1>Vehicle Inventory</h1>
          <p>Manage your entire fleet from one place</p>
        </div>
        <div className="vl-header-actions">
          <button className="vl-btn-export" onClick={handleExport}>
            📥 Export CSV
          </button>
          {user && user.role === 'FLEET_MANAGER' && (
            <button className="vl-btn-add" onClick={handleAdd}>
              + Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="vl-stats">
        <div className="vl-stat">
          <div className="vl-stat-icon" style={{ background: '#eff6ff', color: '#2b5ce6' }}>🚛</div>
          <div>
            <div className="vl-stat-value">{total}</div>
            <div className="vl-stat-label">Total Fleet</div>
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
          <div className="vl-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>🔧</div>
          <div>
            <div className="vl-stat-value">{maintenance}</div>
            <div className="vl-stat-label">Maintenance</div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="vl-search-wrap">
        <span className="vl-search-icon">🔍</span>
        <input
          type="text"
          className="vl-search"
          placeholder="Search by VIN, License Plate, Model or Status..."
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
          Found <strong>{filteredItems.length}</strong> vehicle{filteredItems.length !== 1 ? 's' : ''} matching "{searchTerm}"
        </div>
      )}

      {/* TABLE */}
      <div className="vl-table-card">
        <table className="vl-table">
          <thead>
            <tr>
              <th>VIN</th>
              <th>License Plate</th>
              <th>Model</th>
              <th>Status</th>
              <th>Mileage</th>
              {user && user.role === 'FLEET_MANAGER' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={user && user.role === 'FLEET_MANAGER' ? 6 : 5} style={{ padding: 0 }}>
                  <div className="vl-empty">
                    <div className="vl-empty-icon">🚛</div>
                    <div className="vl-empty-title">
                      {searchTerm ? 'No vehicles match your search' : 'No vehicles available'}
                    </div>
                    <div className="vl-empty-text">
                      {searchTerm ? 'Try a different search term' : 'Add your first vehicle to get started'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="vl-cell-vin">{vehicle.vin}</td>
                  <td className="vl-cell-plate">{vehicle.licensePlate}</td>
                  <td className="vl-cell-model">{vehicle.model}</td>
                  <td>
                    <span className={`vl-status ${vehicle.status?.toLowerCase()}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="vl-cell-mileage">
                    {(vehicle.currentMileage || 0).toLocaleString()} km
                  </td>
                  {user && user.role === 'FLEET_MANAGER' && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(vehicle)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            background: 'white',
                            color: '#2563eb',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#eff6ff';
                            e.currentTarget.style.borderColor = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <span>✎</span> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            background: 'white',
                            color: '#dc2626',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fef2f2';
                            e.currentTarget.style.borderColor = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
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

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="vl-pagination">
          <button
            className="vl-pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>
          <span className="vl-pagination-info">
            Page {currentPage + 1} of {pagination.totalPages}
          </span>
          <button
            className="vl-pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}

      {showModal && (
        <VehicleForm vehicle={selectedVehicle} onClose={handleClose} />
      )}
    </div>
  );
};

export default VehicleList;