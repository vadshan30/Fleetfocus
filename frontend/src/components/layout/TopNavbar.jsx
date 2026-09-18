import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import DarkModeToggle from '../common/DarkModeToggle';
import './Layout.css';

const TopNavbar = ({ toggleSidebar }) => {
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
    { path: '/live', icon: '📡', label: 'Live Fleet' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="ff-top-navbar">
      <div className="ff-nav-left">
        <button onClick={toggleSidebar} className="ff-menu-btn">
          ☰
        </button>
        <span className="ff-brand-title">
          🚚 FleetFocus
        </span>
      </div>

      <div className="ff-nav-center">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`ff-nav-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="ff-nav-right">
        <span className="ff-welcome-text">
          Welcome, {user.username}!
        </span>
        <DarkModeToggle />
        <button onClick={handleLogout} className="ff-logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;