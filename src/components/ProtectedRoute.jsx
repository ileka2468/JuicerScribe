import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ requireAdmin }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // For admin routes, check if user has admin role
  if (requireAdmin && !user.app_metadata?.is_admin) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}