import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth
import Login from './components/Login';

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
import MaintenanceList from './components/maintenance/MaintenanceList';
import LiveFleet from './components/dashboard/LiveFleet';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const user = useSelector((state) => state.auth.user);
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
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute><VehicleList /></ProtectedRoute>} />
            <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetails /></ProtectedRoute>} />
            <Route path="/drivers" element={<ProtectedRoute><DriverList /></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><TripList /></ProtectedRoute>} />
            <Route path="/maintenance" element={<ProtectedRoute><MaintenanceList /></ProtectedRoute>} />
            <Route path="/live" element={<ProtectedRoute><LiveFleet /></ProtectedRoute>} />
            <Route path="/login" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;