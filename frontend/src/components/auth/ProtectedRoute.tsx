/**
 * Route Protection Components
 * 
 * Components for protecting routes and handling authentication requirements
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './AuthComponents';
import { Card, CardContent } from '../ui/card';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

// Protected Route Component
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <CardContent className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-lg">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        {fallback || <LoginForm />}
      </div>
    );
  }

  // Render children if authenticated or auth not required
  return <>{children}</>;
};

// Auth Guard Hook
export const useAuthGuard = (redirectOnAuth = false) => {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
    isAuthenticated: !!user,
    shouldRedirect: redirectOnAuth && !!user
  };
};

// Conditional Render based on Auth
interface AuthConditionalProps {
  children: ReactNode;
  fallback?: ReactNode;
  when: 'authenticated' | 'unauthenticated';
}

export const AuthConditional: React.FC<AuthConditionalProps> = ({
  children,
  fallback = null,
  when
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <>{fallback}</>;
  }

  const shouldRender = when === 'authenticated' ? !!user : !user;
  
  return shouldRender ? <>{children}</> : <>{fallback}</>;
};