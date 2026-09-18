import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import maintenanceService from '../../services/maintenanceService';
import MaintenanceForm from './MaintenanceForm';
import { exportToCSV } from '../../utils/exportUtils';
import '../../MaintenanceList.css';

const MaintenanceList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.getAll();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    if (location.state?.vehicleId) {
      setSelectedVehicleId(location.state.vehicleId);
      setShowForm(true);
    }
  }, [location.state]);

  const handleExport = () => {
    const exportData = filteredLogs.map(l => ({
      'Service Date': l.serviceDate ? new Date(l.serviceDate).toLocaleString() : 'N/A',
      Vehicle: l.vehicle?.licensePlate || 'N/A',
      Model: l.vehicle?.model || 'N/A',
      Technician: l.technician?.username || 'N/A',
      Description: l.description,
      'Cost ($)': l.cost || 0
    }));
    exportToCSV(exportData, 'maintenance_logs');
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedVehicleId(null);
    fetchLogs();
  };

  const filteredLogs = logs.filter(log =>
    log.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.technician?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = logs.length;
  const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const avgCost = total > 0 ? totalCost / total : 0;
  const thisMonth = logs.filter(l => {
    const d = new Date(l.serviceDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (loading && logs.length === 0) {
    return (
      <div className="ml-page">
        <div className="ml-loading">
          <div className="ml-spinner" />
          <div className="ml-loading-text">Loading Service Records...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-page">
      {/* HEADER */}
      <div className="ml-header">
        <div className="ml-header-left">
          <h1>Maintenance Logs</h1>
          <p>Track all vehicle service history in one place</p>
        </div>
        <div className="ml-header-actions">
          <button className="ml-btn-export" onClick={handleExport}>
            📥 Export CSV
          </button>
          {(user && (user.role === 'FLEET_MANAGER' || user.role === 'MAINTENANCE_TECH')) && (
            <button className="ml-btn-add" onClick={() => { setSelectedVehicleId(null); setShowForm(true); }}>
              + Log Maintenance
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="ml-stats">
        <div className="ml-stat">
          <div className="ml-stat-icon" style={{ background: '#eff6ff', color: '#2b5ce6' }}>🔧</div>
          <div>
            <div className="ml-stat-value">{total}</div>
            <div className="ml-stat-label">Total Services</div>
          </div>
        </div>
        <div className="ml-stat">
          <div className="ml-stat-icon" style={{ background: '#ecfdf5', color: '#16a34a' }}>💰</div>
          <div>
            <div className="ml-stat-value">${totalCost.toFixed(0)}</div>
            <div className="ml-stat-label">Total Spent</div>
          </div>
        </div>
        <div className="ml-stat">
          <div className="ml-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>📊</div>
          <div>
            <div className="ml-stat-value">${avgCost.toFixed(0)}</div>
            <div className="ml-stat-label">Avg Cost</div>
          </div>
        </div>
        <div className="ml-stat">
          <div className="ml-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>📅</div>
          <div>
            <div className="ml-stat-value">{thisMonth}</div>
            <div className="ml-stat-label">This Month</div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="ml-search-wrap">
        <span className="ml-search-icon">🔍</span>
        <input
          type="text"
          className="ml-search"
          placeholder="Search by Vehicle, Model, Technician or Description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="ml-search-clear" onClick={() => setSearchTerm('')}>
            Clear
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="ml-search-result">
          Found <strong>{filteredLogs.length}</strong> record{filteredLogs.length !== 1 ? 's' : ''} matching "{searchTerm}"
        </div>
      )}

      {/* TABLE */}
      <div className="ml-table-card">
        <table className="ml-table">
          <thead>
            <tr>
              <th>Service Date</th>
              <th>Vehicle</th>
              <th>Technician</th>
              <th>Description</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: 0 }}>
                  <div className="ml-empty">
                    <div className="ml-empty-icon">🔧</div>
                    <div className="ml-empty-title">
                      {searchTerm ? 'No records match your search' : 'No maintenance logs yet'}
                    </div>
                    <div className="ml-empty-text">
                      {searchTerm ? 'Try a different search term' : 'Log your first maintenance to get started'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="ml-cell-date">
                    {log.serviceDate ? new Date(log.serviceDate).toLocaleString() : 'N/A'}
                  </td>
                  <td>
                    <span className="ml-cell-plate">
                      {log.vehicle?.licensePlate || 'N/A'}
                    </span>
                    <span className="ml-cell-model">
                      {log.vehicle?.model || ''}
                    </span>
                  </td>
                  <td className="ml-cell-tech">{log.technician?.username || 'N/A'}</td>
                  <td className="ml-cell-desc">{log.description}</td>
                  <td className="ml-cell-cost">${(log.cost || 0).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredLogs.length > 0 && (
          <div className="ml-summary">
            <div className="ml-summary-item">
              🔧 Total Services: <span className="ml-summary-value">{filteredLogs.length}</span>
            </div>
            <div className="ml-summary-item">
              💰 Total Spent: <span className="ml-summary-value">
                ${filteredLogs.reduce((sum, l) => sum + (l.cost || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <MaintenanceForm
          onClose={handleClose}
          preselectedVehicleId={selectedVehicleId}
        />
      )}
    </div>
  );
};

export default MaintenanceList;