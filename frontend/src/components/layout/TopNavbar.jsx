import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import DarkModeToggle from '../common/DarkModeToggle';

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
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'white',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#1a2a3a',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          ☰
        </button>
        <span style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1a2a3a'
        }}>
          🚚 FleetFocus
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flex: 1,
        justifyContent: 'center'
      }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive(item.path) ? '#2563eb' : '#64748b',
              background: isActive(item.path) ? '#eff6ff' : 'transparent',
              fontWeight: isActive(item.path) ? '600' : '500',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#1a2a3a';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontSize: '13px',
          color: '#64748b',
          fontWeight: '500'
        }}>
          Welcome, {user.username}!
        </span>
        <DarkModeToggle />
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;