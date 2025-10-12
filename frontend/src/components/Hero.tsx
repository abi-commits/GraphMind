import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseFollowerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Particle Network Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number }> = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach((particle2, j) => {
          if (i === j) return;
          const dx = particle.x - particle2.x;
          const dy = particle.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Follower Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center px-6 pt-32 pb-20 overflow-hidden">
      {/* Particle Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Mouse Follower Glow */}
      <div
        ref={mouseFollowerRef}
        className="fixed w-96 h-96 rounded-full pointer-events-none z-10 transition-opacity duration-300"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="container mx-auto max-w-6xl relative z-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            {/* Staggered Word Reveal */}
            <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tight">
              {['GraphMind', 'is', 'a', 'purpose-built', 'tool', 'for', 'knowledge', 'discovery'].map((word, i) => (
                <span
                  key={i}
                  className="inline-block mr-3 animate-fade-in"
                  style={{
                    animationDelay: `${0.1 + i * 0.1}s`,
                    opacity: 0,
                    animationFillMode: 'forwards'
                  }}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p 
              className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl leading-relaxed animate-fade-in"
              style={{ animationDelay: '1s', opacity: 0, animationFillMode: 'forwards' }}
            >
              Meet the system for modern AI research.
            </p>
            <p 
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed animate-fade-in"
              style={{ animationDelay: '1.2s', opacity: 0, animationFillMode: 'forwards' }}
            >
              Streamline documents, knowledge graphs, and AI-powered insights.
            </p>

            {/* Pulsing CTA with Shimmer */}
            <div 
              className="flex flex-wrap gap-4 items-center animate-fade-in"
              style={{ animationDelay: '1.1s', opacity: 0, animationFillMode: 'forwards' }}
            >
              <Button 
                size="lg" 
                className="relative bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-base h-12 overflow-hidden group animate-pulse-subtle"
              >
                <span className="relative z-10">Start building</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </Button>
              <a href="#features" className="text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                Explore features <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 3D Wireframe Cubes */}
          <div 
            className="hidden md:block relative h-[500px] animate-fade-in"
            style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Cube 1 */}
              <div className="absolute w-40 h-40 animate-float" style={{ animationDelay: '0s' }}>
                <div className="w-full h-full border border-white/20 rotate-45 animate-spin-slow" />
              </div>
              
              {/* Cube 2 */}
              <div className="absolute w-32 h-32 animate-float" style={{ animationDelay: '0.5s', top: '20%', right: '10%' }}>
                <div className="w-full h-full border border-white/15 rotate-12 animate-spin-slow-reverse" />
              </div>
              
              {/* Cube 3 */}
              <div className="absolute w-24 h-24 animate-float" style={{ animationDelay: '1s', bottom: '20%', left: '15%' }}>
                <div className="w-full h-full border border-white/10 -rotate-12 animate-spin-slow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent animate-scroll-line" />
        <ChevronDown className="w-4 h-4 text-white/50" />
      </div>
    </section>
  );
};

export default Hero;
