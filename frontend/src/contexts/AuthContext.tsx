/**
 * Authentication Context for GraphMind
 * 
 * Provides authentication state and functions throughout the React app.
 * Handles Firebase authentication with Google and GitHub providers.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  onAuthStateChange, 
  signInWithGoogle, 
  signInWithGithub, 
  signOutUser,
  getCurrentUserToken 
} from '../lib/firebase';

// Types
interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Get and store user token
  const updateToken = async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const idToken = await getCurrentUserToken();
        setToken(idToken);
      } catch (error) {
        console.error('Error getting user token:', error);
        setToken(null);
      }
    } else {
      setToken(null);
    }
  };

  // Refresh token manually
  const refreshToken = async () => {
    if (user) {
      await updateToken(user);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle GitHub sign in
  const handleGithubSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGithub();
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      console.error('GitHub sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOutUser();
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      await updateToken(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Refresh token periodically (every 50 minutes, tokens expire in 1 hour)
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        await refreshToken();
      }, 50 * 60 * 1000); // 50 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    token,
    signInWithGoogle: handleGoogleSignIn,
    signInWithGithub: handleGithubSignIn,
    signOut: handleSignOut,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// HOC for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div>Please sign in to access this page.</div> 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AuthContext;