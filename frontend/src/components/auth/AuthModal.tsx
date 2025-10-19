/**
 * Advanced Authentication Components
 * 
 * Modal-based authentication with explicit login/signup options
 */

import React, { useState } from 'react';
import { Github } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';

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

interface AuthModalProps {
  trigger?: React.ReactNode;
  defaultTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  trigger = <Button>Get Started</Button>,
  defaultTab = 'login'
}) => {
  const { signInWithGoogle, signInWithGithub, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      setIsOpen(false);
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    }
  };

  const handleGithubAuth = async () => {
    try {
      setError(null);
      await signInWithGithub();
      setIsOpen(false);
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    }
  };

  const AuthContent = ({ isSignup = false }: { isSignup?: boolean }) => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {isSignup ? 'Create your GraphMind account' : 'Welcome back'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isSignup 
            ? 'Start building knowledge graphs and analyzing documents'
            : 'Sign in to access your knowledge graphs and documents'
          }
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full h-12"
        >
          <GoogleIcon />
          <span className="ml-3">
            {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleGithubAuth}
          disabled={loading}
          className="w-full h-12"
        >
          <Github className="w-5 h-5" />
          <span className="ml-3">
            {isSignup ? 'Sign up with GitHub' : 'Sign in with GitHub'}
          </span>
        </Button>
      </div>
      
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>
          {isSignup 
            ? 'Already have an account? Switch to Sign In tab.'
            : 'New to GraphMind? Switch to Sign Up tab.'
          }
        </p>
        <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>GraphMind</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6">
            <AuthContent isSignup={false} />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <AuthContent isSignup={true} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Login/Signup Buttons
export const LoginSignupButtons: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <AuthModal 
        trigger={
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
            Sign In
          </Button>
        }
        defaultTab="login"
      />
      <AuthModal 
        trigger={
          <Button className="bg-white text-black hover:bg-white/90">
            Sign Up
          </Button>
        }
        defaultTab="signup"
      />
    </div>
  );
};