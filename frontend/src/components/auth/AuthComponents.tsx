/**
 * Authentication Components
 * 
 * Login and logout UI components for Firebase authentication
 */

import React, { useState } from 'react';
import { Github, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Google Icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Login/Signup Component
export const LoginForm: React.FC = () => {
  const { signInWithGoogle, signInWithGithub, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      // Navigate to dashboard after successful sign in
      navigate('/upload-and-query');
    } catch (error: any) {
      setError(error.message || 'Failed to authenticate with Google');
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setError(null);
      await signInWithGithub();
      // Navigate to dashboard after successful sign in
      navigate('/upload-and-query');
    } catch (error: any) {
      setError(error.message || 'Failed to authenticate with GitHub');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome to GraphMind</CardTitle>
        <CardDescription className="text-center">
          Sign in or create your account to start building knowledge graphs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-12"
        >
          <GoogleIcon />
          <span className="ml-3">Sign in / Sign up with Google</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleGithubSignIn}
          disabled={loading}
          className="w-full h-12"
        >
          <Github className="w-5 h-5" />
          <span className="ml-3">Sign in / Sign up with GitHub</span>
        </Button>
        
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>New to GraphMind? Your account will be created automatically.</p>
          <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </CardContent>
    </Card>
  );
};

// User Profile Component
export const UserProfile: React.FC = () => {
  const { user, signOut, loading } = useAuth();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="hidden sm:block">
          <div className="text-sm font-medium">
            {user.displayName || user.email}
          </div>
          <div className="text-xs text-muted-foreground">
            {user.email}
          </div>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={loading}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="w-4 h-4" />
        <span className="sr-only">Sign out</span>
      </Button>
    </div>
  );
};

// Auth Status Component
export const AuthStatus: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (user) {
    return <UserProfile />;
  }

  return null;
};

// Simple Login/Signup Button
export const LoginButton: React.FC = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <UserProfile />;
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Navigate to dashboard after successful sign in
      navigate('/upload-and-query');
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  return (
    <Button onClick={handleSignIn} disabled={loading} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
      {loading ? 'Loading...' : 'Sign In / Sign Up'}
    </Button>
  );
};