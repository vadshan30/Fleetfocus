import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../store/slices/authSlice';

export const normalizeRole = (role) => {
  if (!role) return '';
  const clean = role.replace(/^ROLE_/, '').toUpperCase();
  if (clean === 'MAINTENANCE_TECH' || clean === 'TECHNICIAN') {
    return 'TECHNICIAN';
  }
  return clean;
};

export const useAuth = () => {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();

  const rawRole = user?.role || (user ? localStorage.getItem('role') : '');
  const normalizedRole = normalizeRole(rawRole);

  const isManager = () => normalizedRole === 'FLEET_MANAGER';
  const isDispatcher = () => normalizedRole === 'DISPATCHER';
  const isDriver = () => normalizedRole === 'DRIVER';
  const isTechnician = () => normalizedRole === 'TECHNICIAN';
  const isManagerOrDispatcher = () =>
    normalizedRole === 'FLEET_MANAGER' || normalizedRole === 'DISPATCHER';

  const isAuthorized = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.some((role) => normalizeRole(role) === normalizedRole);
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const authUser = useMemo(() => {
    return user ? { ...user, role: normalizedRole, rawRole } : null;
  }, [user, normalizedRole, rawRole]);

  return {
    user: authUser,
    role: normalizedRole,
    rawRole,
    isManager,
    isDispatcher,
    isDriver,
    isTechnician,
    isManagerOrDispatcher,
    isAuthorized,
    logout,
  };
};

export default useAuth;
