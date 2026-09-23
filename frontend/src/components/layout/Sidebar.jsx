import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../config/navConfig';
import DarkModeToggle from '../common/DarkModeToggle';
import Icon from '../ui/Icon';
import ConfirmDialog from '../ui/ConfirmDialog';
import './Layout.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, role, isAuthorized, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) return null;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
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
    <>
      <div className={`ff-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="ff-sidebar-header">
          <div className="ff-sidebar-brand">
            <span className="text-xl">🚚</span>
            <span>FleetFocus</span>
          </div>
          <button onClick={toggleSidebar} className="ff-sidebar-close-btn" aria-label="Close menu">
            ✕
          </button>
        </div>

        <div className="ff-sidebar-menu">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={toggleSidebar}
              className={`ff-sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <Icon name={item.icon} size={18} className="ff-sidebar-link-icon" />
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
                {role ? role.replace('_', ' ') : 'User'}
              </div>
            </div>
            <DarkModeToggle />
          </div>
          <button onClick={handleLogoutClick} className="ff-sidebar-logout-btn" aria-haspopup="dialog">
            <Icon name="LogOut" size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div onClick={toggleSidebar} className="ff-sidebar-overlay" />
      )}

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out?"
        message="Are you sure you want to sign out of FleetFocus?"
        confirmText="Sign Out"
        cancelText="Cancel"
      />
    </>
  );
};

export default Sidebar;