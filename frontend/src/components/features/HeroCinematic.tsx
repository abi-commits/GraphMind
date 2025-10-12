import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

const HeroCinematic = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const nodesRef = useRef<Node[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes in 3D space
    nodesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 500 - 250,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.5,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        if (node.z < -250 || node.z > 250) node.vz *= -1;

        // Calculate scale based on depth
        const scale = 1 + node.z / 500;
        const radius = 2 * scale;
        const opacity = 0.3 + (node.z + 250) / 500 * 0.4;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // Draw connections
        nodes.forEach((other, j) => {
          if (j <= i) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dz = other.z - node.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 150) * 0.15})`;
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

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden noise-texture vignette"
      onMouseMove={handleMouseMove}
    >
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      {/* Scanning line */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
        {/* Holographic badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-white animate-glow-pulse" />
          <span className="text-sm text-white/80">Next-Gen Knowledge Graphs</span>
        </div>

        {/* Main heading with glitch effect */}
        <h1 
          className="text-7xl md:text-9xl font-bold mb-6 tracking-tight"
          style={{
            transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <span 
            className="inline-block text-glow animate-fade-in-up"
            style={{
              background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 60%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            GraphMind
          </span>
        </h1>

        {/* Subtitle with parallax */}
        <p 
          className="text-xl md:text-2xl text-white/70 mb-4 max-w-3xl mx-auto animate-fade-in"
          style={{
            transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
            transition: 'transform 0.3s ease-out',
            animationDelay: '0.2s',
          }}
        >
          Transform documents into intelligent, queryable knowledge graphs
        </p>

        <p 
          className="text-lg text-white/50 mb-12 max-w-2xl mx-auto animate-fade-in"
          style={{
            transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)`,
            transition: 'transform 0.3s ease-out',
            animationDelay: '0.3s',
          }}
        >
          Powered by RAG, LLMs, and ephemeral graph structures for lightning-fast insights
        </p>

        {/* CTA with magnetic effect */}
        <div className="flex items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button
            size="lg"
            className="group relative px-8 py-6 text-lg font-semibold bg-white text-black hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              transform: `translate(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px)`,
              transition: 'transform 0.2s ease-out',
            }}
          >
            Start Building
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer -z-10" />
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg glass glass-hover border-white/20 hover:border-white/40 transition-all duration-300"
          >
            View Demo
          </Button>
        </div>

        {/* Floating stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {[
            { value: '10K+', label: 'Documents Processed' },
            { value: '99.9%', label: 'Accuracy Rate' },
            { value: '<100ms', label: 'Query Response' },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass rounded-lg p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              style={{
                animationDelay: `${0.6 + i * 0.1}s`,
              }}
            >
              <div className="text-3xl font-bold text-glow mb-2">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3D orbiting graph preview (bottom right) */}
      <div className="absolute bottom-12 right-12 w-48 h-48 perspective-1500 animate-float hidden lg:block">
        <div className="preserve-3d animate-rotate-3d">
          <div className="absolute inset-0 glass rounded-full border-2 border-white/20" style={{ transform: 'rotateX(60deg)' }} />
          <div className="absolute inset-0 glass rounded-full border-2 border-white/20" style={{ transform: 'rotateY(60deg)' }} />
          <div className="absolute inset-0 glass rounded-full border-2 border-white/20" style={{ transform: 'rotateX(-60deg)' }} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <span className="text-sm text-white/50">Scroll to explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
};

export default HeroCinematic;
