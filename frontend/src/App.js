import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Auth & Access Control
import Login from './components/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import AccessDenied from './components/common/AccessDenied';

// Layout
import Sidebar from './components/layout/Sidebar';
import TopNavbar from './components/layout/TopNavbar';
import NotificationStack from './components/common/NotificationStack';

// Pages
import Dashboard from './components/dashboard/Dashboard';
import VehicleList from './components/vehicles/VehicleList';
import VehicleDetails from './components/vehicles/VehicleDetails';
import DriverList from './components/drivers/DriverList';
import TripList from './components/trips/TripList';
import MyTripsPage from './components/trips/MyTripsPage';
import MyVehiclePage from './components/vehicles/MyVehiclePage';
import MaintenanceList from './components/maintenance/MaintenanceList';
import LiveFleet from './components/dashboard/LiveFleet';
import LiveFleetPage from './components/live/LiveFleetPage';
import AlertCenterPage from './components/alerts/AlertCenterPage';
import AlertRulesPage from './components/settings/AlertRulesPage';
import PlaybackPage from './components/playback/PlaybackPage';

import './App.css';

function App() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ============ NOT LOGGED IN ============
  if (!user) {
    return (
      <>
        <NotificationStack />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }

  // ============ LOGGED IN ============
  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay active" onClick={toggleSidebar} />
      )}

      <div className="app-main">
        <TopNavbar toggleSidebar={toggleSidebar} />
        <NotificationStack />

        <div className="app-content">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER', 'DRIVER', 'TECHNICIAN']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER', 'DRIVER', 'TECHNICIAN']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER', 'TECHNICIAN']}>
                  <VehicleList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicles/:id"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER', 'TECHNICIAN']}>
                  <VehicleDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER']}>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER']}>
                  <TripList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-trips"
              element={
                <ProtectedRoute roles={['DRIVER']}>
                  <MyTripsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-vehicle"
              element={
                <ProtectedRoute roles={['DRIVER']}>
                  <MyVehiclePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'TECHNICIAN']}>
                  <MaintenanceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER']}>
                  <LiveFleet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-fleet"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER']}>
                  <LiveFleetPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playback"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER']}>
                  <PlaybackPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER', 'DISPATCHER', 'TECHNICIAN']}>
                  <AlertCenterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/alerts"
              element={
                <ProtectedRoute roles={['FLEET_MANAGER']}>
                  <AlertRulesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/403" element={<AccessDenied />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;