import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { AuthStatus } from '@/components/auth/AuthComponents';
import { LoginSignupButtons } from '@/components/auth/AuthModal';
import { AuthConditional } from '@/components/auth/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Users, Zap, TrendingUp, Award, Mail, Linkedin } from 'lucide-react';

interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

const About = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes in 3D space
    nodesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 300 - 150,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.3,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;

      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        if (node.z < -150 || node.z > 150) node.vz *= -1;

        const scale = 200 / (200 + node.z);
        const x2d = node.x * scale;
        const y2d = node.y * scale;
        const size = Math.max(1, 3 * scale);

        // Draw node
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + scale * 0.3})`;
        ctx.fill();

        // Draw connections
        nodes.slice(i + 1).forEach((otherNode) => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const dz = node.z - otherNode.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 150) {
            const otherScale = 200 / (200 + otherNode.z);
            const ox2d = otherNode.x * otherScale;
            const oy2d = otherNode.y * otherScale;

            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            ctx.lineTo(ox2d, oy2d);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const values = [
    {
      icon: Brain,
      title: 'Innovation',
      description: 'We push the boundaries of AI and knowledge graph technology to deliver cutting-edge solutions.',
    },
    {
      icon: Target,
      title: 'Precision',
      description: 'Our algorithms ensure accurate entity extraction and relationship mapping for reliable insights.',
    },
    {
      icon: Users,
      title: 'User-Centric',
      description: 'We design with users in mind, making complex technology accessible and intuitive.',
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Lightning-fast processing and real-time updates keep you ahead of the curve.',
    },
  ];

  const timeline = [
    {
      year: '2023',
      title: 'Foundation',
      description: 'GraphMind was founded with a vision to revolutionize document intelligence.',
    },
    {
      year: '2024',
      title: 'Launch',
      description: 'Released our first product, enabling teams to build knowledge graphs from documents.',
    },
    {
      year: '2024',
      title: 'Growth',
      description: 'Reached 10,000 active users and processed over 1 million documents.',
    },
    {
      year: '2025',
      title: 'Innovation',
      description: 'Introduced advanced AI models and real-time collaboration features.',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 3D Network Background - Full Page */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full opacity-30 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      
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
              <a href="/#features" className="
                text-sm text-white/70 hover:text-white 
                transition-colors duration-200 
                px-3 py-2 rounded-lg hover:bg-white/10
              ">
                Features
              </a>
              <a href="/about" className="
                text-sm text-white hover:text-white 
                transition-colors duration-200 
                px-3 py-2 rounded-lg bg-white/10
              ">
                About
              </a>
              <a href="/contact" className="
                text-sm text-white/70 hover:text-white 
                transition-colors duration-200 
                px-3 py-2 rounded-lg hover:bg-white/10
              ">
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="relative max-w-7xl mx-auto text-center" style={{ zIndex: 1 }}>
          <h1 className="text-6xl font-bold mb-6 text-glow">
            About GraphMind
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            We're on a mission to transform how organizations understand and leverage their knowledge. 
            By combining cutting-edge AI with intuitive design, we make complex data relationships accessible to everyone.
          </p>
        </div>
      </section>

      {/* About Me Section */}
      <section className="relative py-20 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold mb-8 text-center text-glow">About the Creator</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-white/5">
                  <img 
                    src="/abinesh.png" 
                    alt="Abinesh" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Abinesh</h3>
                <p className="text-white/90 mb-4 font-medium">AI/ML Engineer & Creator of GraphMind</p>
                <p className="text-white/70 leading-relaxed mb-6">
                  As an AI/ML engineer passionate about knowledge graphs and natural language processing, 
                  I created GraphMind to bridge the gap between complex data relationships and actionable insights. 
                  My vision is to make advanced AI technology accessible to everyone, enabling organizations to 
                  unlock the full potential of their knowledge bases.
                </p>
                <div className="flex gap-4">
                  <a 
                    href="mailto:abinesh.ai.ml@gmail.com" 
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    abinesh.ai.ml@gmail.com
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/abinesh05/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    linkedin.com/in/abinesh05
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-20 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-12 border border-white/10 text-center">
            <h2 className="text-4xl font-bold mb-6 text-glow">Our Mission</h2>
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              To empower organizations with intelligent knowledge graph technology that reveals hidden insights, 
              accelerates decision-making, and unlocks the true potential of their data.
            </p>
            <p className="text-lg text-white/70 leading-relaxed">
              We believe that every document contains valuable knowledge waiting to be discovered. 
              GraphMind makes it possible to extract, visualize, and query that knowledge in ways that were never before possible.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-glow">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="glass rounded-2xl p-8 border border-white/10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl glass border border-white/10 mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                  <p className="text-white/70 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-20 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-glow">Our Journey</h2>
          <div className="space-y-8">
            {timeline.map((milestone, index) => (
              <div key={index} className="flex gap-8 group">
                <div className="flex-shrink-0 w-24 text-right">
                  <div className="text-2xl font-bold text-white/90 group-hover:text-white transition-colors">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-white/30 group-hover:bg-white group-hover:glow-subtle transition-all" />
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-white/10 group-hover:bg-white/20 transition-colors" />
                  )}
                </div>
                <div className="flex-1 pb-12">
                  <div className="glass rounded-xl p-6 border border-white/10 group-hover:border-white/20 transition-all">
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-white/70">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-16">
          <h2 className="text-5xl font-bold mb-6 text-glow">
            Join Us on This Journey
          </h2>
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            Experience the power of intelligent knowledge graphs and transform how you work with information.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg bg-white text-black hover:bg-white/90"
              onClick={() => navigate('/upload-and-query')}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-6 text-lg glass glass-hover border-white/20"
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
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

export default About;
