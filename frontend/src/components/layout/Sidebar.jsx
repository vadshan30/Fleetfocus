import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import DarkModeToggle from '../common/DarkModeToggle';

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
    { path: '/live', icon: '📡', label: 'Live Fleet' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '260px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        zIndex: 1000,
        overflow: 'hidden',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          minHeight: '70px'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🚚</span>
            <span>FleetFocus</span>
          </div>
          <button
            onClick={toggleSidebar}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            ✕
          </button>
        </div>

        <div style={{
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          marginTop: '8px'
        }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={toggleSidebar}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive(item.path) ? 'white' : '#94a3b8',
                background: isActive(item.path) ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: isActive(item.path) ? '600' : '400',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive(item.path) && (
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#60a5fa'
                }} />
              )}
            </Link>
          ))}
        </div>

        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: 0,
          right: 0,
          padding: '0 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              flexShrink: 0
            }}>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.username}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#94a3b8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.role?.replace('_', ' ') || 'User'}
              </div>
            </div>
            <DarkModeToggle />
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '10px 16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: 'none',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}
    </>
  );
};

export default Sidebar;