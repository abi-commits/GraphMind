import HeroCinematic from '@/components/HeroCinematic';
import Features3D from '@/components/Features3D';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
              Features
            </a>
            <a href="#docs" className="text-sm text-white/70 hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-white/70 hover:text-white hover:bg-white/5"
            >
              Sign In
            </Button>
            <Button className="bg-white text-black hover:bg-white/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

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
            <Button size="lg" className="px-8 py-6 text-lg bg-white text-black hover:bg-white/90">
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-6 text-lg glass glass-hover border-white/20"
            >
              Schedule Demo
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
              <a href="#" className="hover:text-white transition-colors">Contact</a>
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
