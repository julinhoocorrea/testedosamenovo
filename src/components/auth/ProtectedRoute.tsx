import type React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string;
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Double check with sessionStorage token
  const hasToken = typeof window !== 'undefined' ? sessionStorage.getItem('auth-token') : null;

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    hasToken: !!hasToken,
    user: user?.email,
    requireRole,
    userRole: user?.role,
    location: location.pathname
  });

  // Check both Zustand state AND sessionStorage token
  if (!isAuthenticated && !hasToken) {
    console.log('🚫 Not authenticated (state and token missing), redirecting to login');
    // Clear any stale data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth-token');
    }
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check if user has that role
  if (requireRole && user?.role !== requireRole) {
    console.log('🚫 Insufficient role, redirecting to dashboard');
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Protected route access granted');
  return <>{children}</>;
}
