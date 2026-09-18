import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import tripService from '../../services/tripService';
import TripForm from './TripForm';
import ScheduleTripForm from './ScheduleTripForm';
import { exportToCSV } from '../../utils/exportUtils';
import '../../TripList.css';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useSelector((state) => state.auth.user);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getAll();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleEndTrip = async (id) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return;

    if (trip.status === 'COMPLETED') {
      if (window.addNotification) {
        window.addNotification('Trip is already completed!', 'warning');
      }
      return;
    }

    if (trip.status === 'CANCELLED') {
      if (window.addNotification) {
        window.addNotification('Cannot end a cancelled trip!', 'warning');
      }
      return;
    }

    const distance = prompt('Enter distance covered (km):', '0');
    if (distance === null) return;

    try {
      await tripService.end(id, parseFloat(distance));
      if (window.addNotification) {
        window.addNotification('Trip ended successfully!', 'success');
      }
      fetchTrips();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error ending trip!';
      if (window.addNotification) {
        window.addNotification(errorMsg, 'error');
      }
    }
  };

  const handleCancelTrip = async (id) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return;

    if (trip.status === 'COMPLETED') {
      if (window.addNotification) {
        window.addNotification('Cannot cancel a completed trip!', 'warning');
      }
      return;
    }

    if (trip.status === 'CANCELLED') {
      if (window.addNotification) {
        window.addNotification('Trip is already cancelled!', 'warning');
      }
      return;
    }

    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        await tripService.cancel(id);
        if (window.addNotification) {
          window.addNotification('Trip cancelled successfully!', 'success');
        }
        fetchTrips();
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Error cancelling trip!';
        if (window.addNotification) {
          window.addNotification(errorMsg, 'error');
        }
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredTrips.map(t => ({
      ID: `TRP-${t.id}`,
      Vehicle: t.vehicle?.licensePlate || 'N/A',
      Driver: t.driver?.user?.username || 'N/A',
      'Start Time': t.startTime ? new Date(t.startTime).toLocaleString() : 'N/A',
      Status: t.status,
      'Distance (km)': t.distanceCovered || 0
    }));
    exportToCSV(exportData, 'trips');
  };

  const filteredTrips = trips.filter(t =>
    t.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.driver?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `trp-${t.id}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = trips.length;
  const completed = trips.filter(t => t.status === 'COMPLETED').length;
  const inProgress = trips.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE').length;
  const scheduled = trips.filter(t => t.status === 'SCHEDULED').length;

  if (loading && trips.length === 0) {
    return (
      <div className="tl-page">
        <div className="tl-loading">
          <div className="tl-spinner" />
          <div className="tl-loading-text">Loading Journeys...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tl-page">
      {/* HEADER */}
      <div className="tl-header">
        <div className="tl-header-left">
          <h1>Fleet Trips</h1>
          <p>Manage all your fleet journeys in one place</p>
        </div>
        <div className="tl-header-actions">
          <button className="tl-btn-export" onClick={handleExport}>
            📥 Export CSV
          </button>
          {(user && (user.role === 'FLEET_MANAGER' || user.role === 'DISPATCHER')) && (
            <>
              <button className="tl-btn-dispatch" onClick={() => setShowForm(true)}>
                🚗 Dispatch Vehicle
              </button>
              <button className="tl-btn-schedule" onClick={() => setShowScheduleForm(true)}>
                📅 Schedule Trip
              </button>
            </>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="tl-stats">
        <div className="tl-stat">
          <div className="tl-stat-icon" style={{ background: '#eff6ff', color: '#2b5ce6' }}>📋</div>
          <div>
            <div className="tl-stat-value">{total}</div>
            <div className="tl-stat-label">Total Trips</div>
          </div>
        </div>
        <div className="tl-stat">
          <div className="tl-stat-icon" style={{ background: '#ecfdf5', color: '#16a34a' }}>✅</div>
          <div>
            <div className="tl-stat-value">{completed}</div>
            <div className="tl-stat-label">Completed</div>
          </div>
        </div>
        <div className="tl-stat">
          <div className="tl-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>📍</div>
          <div>
            <div className="tl-stat-value">{inProgress}</div>
            <div className="tl-stat-label">In Progress</div>
          </div>
        </div>
        <div className="tl-stat">
          <div className="tl-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>📅</div>
          <div>
            <div className="tl-stat-value">{scheduled}</div>
            <div className="tl-stat-label">Scheduled</div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="tl-search-wrap">
        <span className="tl-search-icon">🔍</span>
        <input
          type="text"
          className="tl-search"
          placeholder="Search by Trip ID, Vehicle, Driver or Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="tl-search-clear" onClick={() => setSearchTerm('')}>
            Clear
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="tl-search-result">
          Found <strong>{filteredTrips.length}</strong> trip{filteredTrips.length !== 1 ? 's' : ''} matching "{searchTerm}"
        </div>
      )}

      {/* TABLE */}
      <div className="tl-table-card">
        <table className="tl-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Start Time</th>
              <th>Status</th>
              <th>Distance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: 0 }}>
                  <div className="tl-empty">
                    <div className="tl-empty-icon">🗺️</div>
                    <div className="tl-empty-title">
                      {searchTerm ? 'No trips match your search' : 'No trips available'}
                    </div>
                    <div className="tl-empty-text">
                      {searchTerm ? 'Try a different search term' : 'Dispatch your first trip to get started'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTrips.map((trip) => (
                <tr key={trip.id}>
                  <td className="tl-cell-id">TRP-{trip.id}</td>
                  <td className="tl-cell-plate">{trip.vehicle?.licensePlate || 'N/A'}</td>
                  <td className="tl-cell-driver">{trip.driver?.user?.username || 'N/A'}</td>
                  <td className="tl-cell-time">
                    {trip.startTime ? new Date(trip.startTime).toLocaleString() : 'N/A'}
                  </td>
                  <td>
                    <span className={`tl-status ${trip.status?.toLowerCase()}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="tl-cell-distance">
                    {trip.distanceCovered || 0} km
                  </td>
                  <td>
                    <div className="tl-actions">
                      {(trip.status === 'IN_PROGRESS' || trip.status === 'ACTIVE') && (
                        <button
                          className="tl-btn-action tl-btn-end"
                          onClick={() => handleEndTrip(trip.id)}
                        >
                          <span>✓</span> End
                        </button>
                      )}
                      {(trip.status === 'SCHEDULED' || trip.status === 'IN_PROGRESS' || trip.status === 'ACTIVE') && (
                        <button
                          className="tl-btn-action tl-btn-cancel"
                          onClick={() => handleCancelTrip(trip.id)}
                        >
                          <span>✕</span> Cancel
                        </button>
                      )}
                      {(trip.status === 'COMPLETED' || trip.status === 'CANCELLED') && (
                        <span className="tl-no-action">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <TripForm onClose={() => { setShowForm(false); fetchTrips(); }} />
      )}

      {showScheduleForm && (
        <ScheduleTripForm onClose={() => { setShowScheduleForm(false); fetchTrips(); }} />
      )}
    </div>
  );
};

export default TripList;