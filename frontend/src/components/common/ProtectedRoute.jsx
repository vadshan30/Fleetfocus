import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthorized } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !isAuthorized(roles)) {
    return <AccessDenied />;
  }

  return children;
};

export default ProtectedRoute;
