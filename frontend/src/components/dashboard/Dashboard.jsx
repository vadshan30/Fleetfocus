import React from 'react';
import useAuth from '../../hooks/useAuth';
import ManagerDashboard from './ManagerDashboard';
import DispatcherDashboard from './DispatcherDashboard';
import DriverDashboard from './DriverDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import AccessDenied from '../common/AccessDenied';

const Dashboard = () => {
  const { isManager, isDispatcher, isDriver, isTechnician } = useAuth();

  if (isManager()) return <ManagerDashboard />;
  if (isDispatcher()) return <DispatcherDashboard />;
  if (isDriver()) return <DriverDashboard />;
  if (isTechnician()) return <TechnicianDashboard />;

  return <AccessDenied />;
};

export default Dashboard;