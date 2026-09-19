import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import alertService from '../../services/alertService';
import DarkModeToggle from '../common/DarkModeToggle';
import Icon from '../ui/Icon';

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await alertService.getStats();
        setUnacknowledgedCount(stats.unacknowledged || 0);
      } catch (err) {
        console.error('Failed to fetch alert stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-brand">FleetFocus</div>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/vehicles">Vehicles</Link>
        <Link to="/drivers">Drivers</Link>
        <Link to="/trips">Trips</Link>
        <Link to="/live-fleet">Live Fleet</Link>
        {(user.role === 'FLEET_MANAGER' || user.role === 'MAINTENANCE_TECH') && (
          <Link to="/maintenance">Maintenance</Link>
        )}
        <Link to="/alerts" className="relative">
          Alerts
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unacknowledgedCount > 99 ? '99+' : unacknowledgedCount}
            </span>
          )}
        </Link>
      </div>
      <div className="nav-user">
        <DarkModeToggle />
        <span>Welcome back, {user.username}!</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;