import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { AuthStatus } from '@/components/auth/AuthComponents';
import { LoginSignupButtons } from '@/components/auth/AuthModal';
import { AuthConditional } from '@/components/auth/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { Mail, Linkedin, Send } from 'lucide-react';

interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you could add logic to send the form data to a backend
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 3D Network Background - Full Page */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full opacity-30 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo onClick={() => navigate('/')} />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm text-white/70 hover:text-white transition-colors">
              Features
            </a>
            <a href="/about" className="text-sm text-white/70 hover:text-white transition-colors">
              About
            </a>
            <a href="/contact" className="text-sm text-white hover:text-white transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <AuthConditional when="unauthenticated">
              <LoginSignupButtons />
            </AuthConditional>
            <AuthConditional when="authenticated">
              <AuthStatus />
              <Button 
                className="bg-white text-black hover:bg-white/90"
                onClick={() => navigate('/upload-and-query')}
              >
                Dashboard
              </Button>
            </AuthConditional>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 text-glow">
            Get In Touch
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Have questions about GraphMind? We're here to help you unlock the power of knowledge graphs.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative pb-32 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="glass rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-2">Send us a message</h2>
            <p className="text-white/70 mb-8">Fill out the form and we'll get back to you shortly.</p>
            
            {submitted ? (
              <div className="bg-white/10 border border-white/20 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
                <p className="text-white/70">Your message has been sent successfully. We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-white/90" htmlFor="name">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-white/90" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-white/90" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all resize-none"
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-white text-black hover:bg-white/90 font-semibold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="glass rounded-xl p-3 border border-white/10">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white/90 mb-1">Email</h3>
                    <a 
                      href="mailto:abinesh.ai.ml@gmail.com" 
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      abinesh.ai.ml@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="glass rounded-xl p-3 border border-white/10">
                    <Linkedin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white/90 mb-1">LinkedIn</h3>
                    <a 
                      href="https://www.linkedin.com/in/abinesh05/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      linkedin.com/in/abinesh05
                    </a>
                  </div>
                </div>
              </div>
            </div>
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

export default Contact;
