import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import DarkModeToggle from '../common/DarkModeToggle';
import './Layout.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/vehicles', icon: '🚛', label: 'Vehicles' },
    { path: '/drivers', icon: '👤', label: 'Drivers' },
    { path: '/trips', icon: '📍', label: 'Trips' },
    ...(user.role === 'FLEET_MANAGER' || user.role === 'MAINTENANCE_TECH' 
      ? [{ path: '/maintenance', icon: '🔧', label: 'Maintenance' }] 
      : []),
    { path: '/live-fleet', icon: '📡', label: 'Live Fleet' },
    { path: '/playback', icon: '⏱️', label: 'Playback' },
    ...(user.role === 'FLEET_MANAGER' || user.role === 'DISPATCHER' 
      ? [{ path: '/settings/alerts', icon: '⚙️', label: 'Alert Rules' }] 
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className={`ff-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="ff-sidebar-header">
          <div className="ff-sidebar-brand">
            <span>🚚</span>
            <span>FleetFocus</span>
          </div>
          <button onClick={toggleSidebar} className="ff-sidebar-close-btn">
            ✕
          </button>
        </div>

        <div className="ff-sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={toggleSidebar}
              className={`ff-sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="ff-sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {isActive(item.path) && (
                <span className="ff-sidebar-active-dot" />
              )}
            </Link>
          ))}
        </div>

        <div className="ff-sidebar-footer">
          <div className="ff-sidebar-user-card">
            <div className="ff-sidebar-avatar">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ff-sidebar-user-info">
              <div className="ff-sidebar-username">
                {user.username}
              </div>
              <div className="ff-sidebar-userrole">
                {user.role?.replace('_', ' ') || 'User'}
              </div>
            </div>
            <DarkModeToggle />
          </div>
          <button onClick={handleLogout} className="ff-sidebar-logout-btn">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div onClick={toggleSidebar} className="ff-sidebar-overlay" />
      )}
    </>
  );
};

export default Sidebar;