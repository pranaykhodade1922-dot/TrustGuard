import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function AuthGuard() {
  const { user } = useApp();
  const location = useLocation();

  if (!user?.isAuthenticated) {
    const intendedPath = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(intendedPath)}`} replace />;
  }

  return <Outlet />;
}

export default AuthGuard;
