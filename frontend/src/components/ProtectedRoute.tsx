import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, needsTwoFactor } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsTwoFactor && location.pathname !== '/2fa-verify') {
    return <Navigate to="/2fa-verify" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Check if the current route is a password reset related route
  const isPasswordResetRoute = 
    location.pathname === '/reset-password' || 
    location.pathname === '/forgot-password';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only redirect authenticated users if they're not on a password reset route
  if (isAuthenticated && !isPasswordResetRoute) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  }

  return <>{children}</>;
}