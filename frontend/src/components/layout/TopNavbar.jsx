import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../config/navConfig';
import DarkModeToggle from '../common/DarkModeToggle';
import Icon from '../ui/Icon';
import './Layout.css';

const TopNavbar = ({ toggleSidebar }) => {
  const { user, isAuthorized, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = NAV_ITEMS.filter((item) => isAuthorized(item.roles));

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="ff-top-navbar">
      <div className="ff-nav-left">
        <button onClick={toggleSidebar} className="ff-menu-btn" aria-label="Toggle menu">
          ☰
        </button>
        <span className="ff-brand-title">
          🚚 FleetFocus
        </span>
      </div>

      <div className="ff-nav-center">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`ff-nav-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="ff-nav-right">
        <span className="ff-welcome-text">
          Welcome, {user.username}!
        </span>
        <DarkModeToggle />
        <button onClick={handleLogout} className="ff-logout-btn flex items-center gap-1.5">
          <Icon name="LogOut" size={14} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;