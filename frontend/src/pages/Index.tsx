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

      {/* Landing image preview — centered image with CTAs below */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass p-8 rounded-2xl text-center">
            <div className="relative group overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
              <img
                src="/assets/kgraph.png"
                alt="Knowledge graph preview"
                loading="lazy"
                className="w-full max-w-4xl mx-auto h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-2xl transform transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute left-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-lg opacity-30" />
              </div>
            </div>

            <h3 className="text-3xl font-semibold mt-6 animate-fade-in">Explore automatically generated knowledge graphs</h3>
            <p className="text-sm text-white/70 mt-2 mb-4">Visualize entities, concepts and their relationships extracted from your documents. Interactively explore connections and surface insights from your knowledge base.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
              <Button size="sm" className="px-6 py-3 transform transition-transform duration-300 hover:-translate-y-1 hover:scale-105" onClick={() => navigate('/upload-and-query')}>Get Started</Button>
              <Button size="sm" variant="outline" className="px-6 py-3 transform transition-transform duration-300 hover:-translate-y-1 hover:scale-105" onClick={() => navigate('/about')}>Learn More</Button>
            </div>

            <div className="mt-4 text-xs text-white/50">Tip: Upload a document and run a query to auto-generate an interactive knowledge graph.</div>
          </div>
        </div>
      </section>

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
