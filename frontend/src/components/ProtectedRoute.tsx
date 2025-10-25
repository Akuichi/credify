import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  try {
    const auth = useAuth();
    const location = useLocation();

    const isAuthenticated = Boolean(auth?.isAuthenticated);
    const isLoading = Boolean(auth?.isLoading);
    const needsTwoFactor = Boolean(auth?.needsTwoFactor);
    const currentPath = String(location?.pathname || '');

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (needsTwoFactor && currentPath !== '/2fa-verify') {
      return <Navigate to="/2fa-verify" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error('ProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const isLoading = auth?.isLoading ?? true;
  const currentPath = location?.pathname ?? '';
  
  // Check if the current route is a password reset related route
  const isPasswordResetRoute = 
    currentPath === '/reset-password' || 
    currentPath === '/forgot-password';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only redirect authenticated users if they're not on a password reset route
  if (isAuthenticated && !isPasswordResetRoute) {
    const from = location.state?.from;
    const redirectPath = from && typeof from === 'object' && 'pathname' in from 
      ? String(from.pathname)
      : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}