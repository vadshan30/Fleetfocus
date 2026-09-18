import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import authService from '../services/authService';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'DRIVER',
    adminCode: ''
  });
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setRegisterError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({
      username: formData.username,
      password: formData.password
    }));
    if (!result.error) {
      navigate('/');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    // Special admin code validation
    if (formData.role === 'FLEET_MANAGER') {
      if (formData.adminCode !== 'FLEETFOCUS_ADMIN_2026') {
        const msg = 'Invalid Admin Authorization Code. Access denied.';
        setRegisterError(msg);
        if (window.addNotification) {
          window.addNotification(msg, 'error');
        }
        return;
      }
    }

    try {
      await authService.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: formData.role === 'FLEET_MANAGER' ? 'FLEET_MANAGER' : formData.role
      });
      setRegisterSuccess(true);
      setFormData({ username: '', password: '', email: '', role: 'DRIVER', adminCode: '' });
      setIsRegister(false);
      if (window.addNotification) {
        window.addNotification('Account created successfully! Please login.', 'success');
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      setRegisterError(msg);
      if (window.addNotification) {
        window.addNotification(msg, 'error');
      }
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setRegisterError('');
    setRegisterSuccess(false);
    setFormData({ username: '', password: '', email: '', role: 'DRIVER', adminCode: '' });
  };

  return (
    <div className="login-page">
      <div className="login-split">
        {/* LEFT SIDE - BRANDING */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-logo">
              <span className="login-logo-icon">🚚</span>
              <h1 className="login-brand-title">FleetFocus</h1>
            </div>
            <p className="login-brand-subtitle">
              Real-Time Vehicle Telematics & Fleet Management System
            </p>
            <div className="login-features">
              <div className="login-feature">
                <span className="login-feature-icon">📊</span>
                <span>Real-time Fleet Monitoring</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">🗺️</span>
                <span>Live GPS Tracking</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">🔧</span>
                <span>Maintenance Management</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">📈</span>
                <span>Analytics & Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="login-right">
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="login-form-new">
            <h2 className="login-form-title">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="login-form-subtitle">
              {isRegister ? 'Sign up to get started' : 'Sign in to continue to FleetFocus'}
            </p>

            {registerSuccess && (
              <div className="login-alert login-alert-success">
                ✅ Account created! Please login.
              </div>
            )}

            {registerError && (
              <div className="login-alert login-alert-error">
                ⚠️ {registerError}
              </div>
            )}

            {error && !isRegister && (
              <div className="login-alert login-alert-error">
                ⚠️ {error}
              </div>
            )}

            <div className="login-field">
              <label className="login-label">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                className="login-input"
              />
            </div>

            {isRegister && (
              <div className="login-field">
                <label className="login-label">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="login-input"
                />
              </div>
            )}

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="login-input login-input-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="login-field">
                <label className="login-label">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="login-input"
                >
                  <option value="DRIVER">Driver</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="MAINTENANCE_TECH">Maintenance Technician</option>
                  <option value="FLEET_MANAGER">Admin (Fleet Manager)</option>
                </select>
              </div>
            )}

            {isRegister && formData.role === 'FLEET_MANAGER' && (
              <div className="login-field">
                <label className="login-label" style={{ color: '#dc2626' }}>
                  🔒 Admin Authorization Code
                </label>
                <input
                  type="password"
                  name="adminCode"
                  placeholder="Enter admin authorization code"
                  value={formData.adminCode}
                  onChange={handleChange}
                  required
                  className="login-input"
                  style={{ borderColor: '#fecaca' }}
                />
                <div style={{
                  fontSize: '12px',
                  color: '#dc2626',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ This code is required to register as an Admin
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="login-submit-btn">
              {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Login'}
            </button>

            <div className="login-toggle">
              <span>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button type="button" onClick={toggleMode} className="login-toggle-btn">
                {isRegister ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;