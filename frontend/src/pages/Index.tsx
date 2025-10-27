import HeroCinematic from '@/components/HeroCinematic';
import Features3D from '@/components/Features3D';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { AuthConditional } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FloatingNavbar from '@/components/common/FloatingNavbar';
import { LoginSignupButtons } from '@/components/auth/AuthModal';
import { AuthStatus } from '@/components/auth/AuthComponents';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/upload-and-query');
    } else {
      // Will trigger login via LoginButton
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Navigation */}
      <FloatingNavbar currentPage="home" />

      {/* Hero Section */}
      <HeroCinematic />

      {/* Features Section */}
      <div id="features">
        <Features3D />
      </div>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-16">
          <h2 className="text-5xl font-bold mb-6 text-glow">
            Ready to Transform Your Documents?
          </h2>
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            Join thousands of teams using GraphMind to unlock insights from their knowledge bases
          </p>
          <div className="flex items-center justify-center gap-4">
            <AuthConditional 
              when="authenticated"
              fallback={
                <AuthModal 
                  trigger={
                    <Button size="lg" className="px-8 py-6 text-lg bg-white text-black hover:bg-white/90">
                      Start Free Trial
                    </Button>
                  }
                  defaultTab="signup"
                />
              }
            >
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg bg-white text-black hover:bg-white/90"
                onClick={() => navigate('/upload-and-query')}
              >
                Go to Dashboard
              </Button>
            </AuthConditional>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-6 text-lg glass glass-hover border-white/20"
            >
              Schedule Demo
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-6 text-lg glass glass-hover border-blue-500"
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="/about" className="hover:text-white transition-colors">About</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-white/40">
            © 2025 GraphMind. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
