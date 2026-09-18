import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import DarkModeToggle from '../common/DarkModeToggle';

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">FleetFocus</div>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/vehicles">Vehicles</Link>
        <Link to="/drivers">Drivers</Link>
        <Link to="/trips">Trips</Link>
        {(user.role === 'FLEET_MANAGER' || user.role === 'MAINTENANCE_TECH') && (
          <Link to="/maintenance">Maintenance</Link>
        )}
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