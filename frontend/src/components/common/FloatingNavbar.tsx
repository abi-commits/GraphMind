import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { AuthStatus } from '@/components/auth/AuthComponents';
import { LoginSignupButtons } from '@/components/auth/AuthModal';
import { AuthConditional } from '@/components/auth/ProtectedRoute';

interface FloatingNavbarProps {
  currentPage?: 'home' | 'about' | 'contact';
}

const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ currentPage }) => {
  const navigate = useNavigate();

  const getLinkClassName = (page: string) => {
    const baseClasses = "text-sm transition-colors duration-200 px-3 py-2 rounded-lg";
    const isActive = currentPage === page;
    
    if (isActive) {
      return `${baseClasses} text-white bg-white/10`;
    }
    return `${baseClasses} text-white/70 hover:text-white hover:bg-white/10`;
  };

  return (
    <>
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 hover:scale-105">
        <div className="
          glass rounded-full px-8 py-4 
          shadow-2xl shadow-black/20 
          backdrop-blur-xl bg-black/20 
          border border-white/10 
          hover:bg-black/30 hover:shadow-3xl hover:shadow-black/30
          transition-all duration-300 ease-out
        ">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo onClick={() => navigate('/')} />
            </div>
            
            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              {currentPage === 'home' ? (
                <a href="#features" className={getLinkClassName('home')}>
                  Features
                </a>
              ) : (
                <a href="/#features" className={getLinkClassName('home')}>
                  Features
                </a>
              )}
              <a href="/about" className={getLinkClassName('about')}>
                About
              </a>
              <a href="/contact" className={getLinkClassName('contact')}>
                Contact
              </a>
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <AuthConditional when="unauthenticated">
                <div className="hidden sm:block">
                  <LoginSignupButtons />
                </div>
              </AuthConditional>
              <AuthConditional when="authenticated">
                <div className="hidden sm:block">
                  <AuthStatus />
                </div>
                <Button 
                  size="sm"
                  className="
                    bg-white text-black hover:bg-white/90 
                    transition-all duration-200 
                    hover:scale-105 shadow-lg
                  "
                  onClick={() => navigate('/upload-and-query')}
                >
                  Dashboard
                </Button>
              </AuthConditional>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Fallback */}
      <nav className="lg:hidden fixed top-4 right-4 z-50">
        <div className="flex gap-2">
          {/* Mobile Auth */}
          <div className="
            glass rounded-full p-3 
            shadow-xl shadow-black/20 
            backdrop-blur-xl bg-black/20 
            border border-white/10 
            hover:bg-black/30 hover:scale-105
            transition-all duration-300 ease-out
          ">
            <AuthConditional when="unauthenticated">
              <LoginSignupButtons />
            </AuthConditional>
            <AuthConditional when="authenticated">
              <Button 
                size="sm"
                className="bg-white text-black hover:bg-white/90"
                onClick={() => navigate('/upload-and-query')}
              >
                Dashboard
              </Button>
            </AuthConditional>
          </div>
          
          {/* Mobile Logo */}
          <div className="
            glass rounded-full p-3 
            shadow-xl shadow-black/20 
            backdrop-blur-xl bg-black/20 
            border border-white/10 
            hover:bg-black/30 hover:scale-105
            transition-all duration-300 ease-out
          ">
            <Logo onClick={() => navigate('/')} />
          </div>
        </div>
      </nav>
    </>
  );
};

export default FloatingNavbar;