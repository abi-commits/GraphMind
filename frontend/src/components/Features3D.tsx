import { useEffect, useRef, useState } from 'react';
import { FileText, Search, Network, GitBranch, Cloud } from 'lucide-react';

const Features3D = () => {
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-glow">
            How It Works
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Five powerful stages that transform your documents into intelligent insights
          </p>
        </div>

        {/* Features grid */}
        <div className="space-y-32">
          <IngestFeature />
          <RetrievalFeature />
          <GraphFeature />
          <WorkflowFeature />
          <DeployFeature />
        </div>
      </div>
    </section>
  );
};

// Feature 1: Ingest & Index
const IngestFeature = () => {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
          <FileText className="w-4 h-4" />
          <span className="text-sm">Step 1</span>
        </div>
        <h3 className="text-4xl font-bold mb-4">Ingest & Index</h3>
        <p className="text-lg text-white/70 mb-6">
          Upload documents and watch them intelligently chunked into semantic units. 
          Our system preserves context while optimizing for retrieval speed.
        </p>
        <ul className="space-y-3">
          {['Smart chunking', 'Vector embeddings', 'Context preservation'].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-white/60">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* 3D Processing Pipeline */}
      <div className="perspective-1500 h-96 relative flex items-center justify-center">
        {/* Input document */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-32 glass rounded-lg p-3 animate-float"
          style={{ animationDuration: '4s' }}
        >
          <div className="space-y-1">
            <div className="h-1 bg-white/30 rounded w-full" />
            <div className="h-1 bg-white/30 rounded w-3/4" />
            <div className="h-1 bg-white/30 rounded w-full" />
            <div className="h-1 bg-white/30 rounded w-5/6" />
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full animate-glow-pulse" />
        </div>

        {/* Processing funnel */}
        <div className="relative w-64 h-64 preserve-3d">
          {/* Funnel rings */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 border-2 border-white/20 rounded-full"
              style={{
                width: `${200 - i * 40}px`,
                height: `${200 - i * 40}px`,
                transform: `translate(-50%, -50%) translateZ(${i * -50}px)`,
                opacity: 0.4 - i * 0.08,
              }}
            />
          ))}
          
          {/* Flowing particles */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * Math.PI / 180;
            const radius = 40 + (i % 3) * 20;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full"
                style={{
                  transform: `translate(-50%, -50%) translateX(${Math.cos(angle) * radius}px) translateY(${Math.sin(angle) * radius}px) translateZ(${-i * 15}px)`,
                  opacity: 0.6,
                  animation: `float 3s ease-in-out infinite ${i * 0.2}s`,
                }}
              />
            );
          })}
        </div>

        {/* Output chunks */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-20 h-12 glass rounded p-2 transition-all duration-500 hover:scale-110 hover:translate-x-2"
              style={{
                animationDelay: `${i * 0.3}s`,
                animation: 'fade-in 0.6s ease-out forwards',
                opacity: 0,
              }}
            >
              <div className="space-y-1">
                <div className="h-0.5 bg-white/30 rounded" />
                <div className="h-0.5 bg-white/30 rounded w-3/4" />
              </div>
              <div className="text-[8px] text-white/40 mt-1">C{i + 1}</div>
            </div>
          ))}
        </div>

        {/* Flow arrows */}
        <div className="absolute left-24 top-1/2 -translate-y-1/2 flex items-center gap-1 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-0.5 bg-white/30" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
          <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-white/30 border-b-4 border-b-transparent" />
        </div>
        
        <div className="absolute right-24 top-1/2 -translate-y-1/2 flex items-center gap-1 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-0.5 bg-white/30" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
          <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-white/30 border-b-4 border-b-transparent" />
        </div>
      </div>
    </div>
  );
};

// Feature 2: Retrieval + LLM
const RetrievalFeature = () => {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* 3D Search Results */}
      <div className="perspective-1500 h-96 relative order-2 md:order-1">
        {[
          { score: 0.98, title: 'Technical Architecture', snippet: 'Distributed system design patterns...' },
          { score: 0.94, title: 'API Documentation', snippet: 'RESTful endpoint specifications...' },
          { score: 0.89, title: 'Best Practices', snippet: 'Code review guidelines and...' },
        ].map((result, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-80 glass rounded-lg p-6 transition-all duration-500 hover:-translate-y-4 hover:scale-105 cursor-pointer group"
            style={{
              transform: `translate(-50%, -50%) translateZ(${i * -40}px) translateY(${i * 50}px)`,
              animationDelay: `${i * 0.15}s`,
              boxShadow: `0 ${8 + i * 4}px ${24 + i * 8}px rgba(0, 0, 0, ${0.4 + i * 0.05})`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Relevance: {result.score}</span>
              <div className="w-2 h-2 rounded-full bg-green-400 glow-medium" />
            </div>
            <h4 className="font-bold mb-2 group-hover:text-glow transition-all">{result.title}</h4>
            <p className="text-sm text-white/60">{result.snippet}</p>
            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/60 transition-all duration-500"
                style={{ width: `${result.score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="order-1 md:order-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
          <Search className="w-4 h-4" />
          <span className="text-sm">Step 2</span>
        </div>
        <h3 className="text-4xl font-bold mb-4">Retrieval + LLM</h3>
        <p className="text-lg text-white/70 mb-6">
          Lightning-fast semantic search finds the most relevant chunks. 
          Advanced LLMs synthesize answers with perfect context and citations.
        </p>
        <ul className="space-y-3">
          {['Vector similarity search', 'Context-aware ranking', 'Source attribution'].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-white/60">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Feature 3: Ephemeral Knowledge Graph
const GraphFeature = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const nodes: Array<{ x: number; y: number; vx: number; vy: number }> = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        nodes.forEach((other, j) => {
          if (j <= i) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 100) * 0.2})`;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
          <Network className="w-4 h-4" />
          <span className="text-sm">Step 3</span>
        </div>
        <h3 className="text-4xl font-bold mb-4">Ephemeral Knowledge Graph</h3>
        <p className="text-lg text-white/70 mb-6">
          Dynamic graphs emerge on-demand, connecting concepts across your documents. 
          Discover relationships you never knew existed.
        </p>
        <ul className="space-y-3">
          {['Relationship extraction', 'On-demand generation', 'Interactive exploration'].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-white/60">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass rounded-2xl p-8 h-96 relative overflow-hidden group">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-white glow-strong animate-glow-pulse" />
            <span className="text-sm text-white/80">Live graph visualization</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature 4: Agentic Workflow
const WorkflowFeature = () => {
  const stages = [
    { name: 'Summarizer', icon: '📝', desc: 'Extract key information' },
    { name: 'Builder', icon: '🔨', desc: 'Structure knowledge' },
    { name: 'Analyst', icon: '🔍', desc: 'Generate insights' },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className="perspective-1500 h-96 relative order-2 md:order-1">
        <div className="relative h-full flex items-center justify-center gap-8">
          {stages.map((stage, i) => (
            <div
              key={i}
              className="glass rounded-xl p-8 w-48 h-64 flex flex-col items-center justify-center transition-all duration-500 hover:scale-110 hover:-translate-y-4 cursor-pointer group preserve-3d"
              style={{
                animationDelay: `${i * 0.2}s`,
                transform: `rotateY(${i * 5}deg)`,
              }}
            >
              <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">
                {stage.icon}
              </div>
              <h4 className="font-bold text-lg mb-2 text-center">{stage.name}</h4>
              <p className="text-sm text-white/60 text-center">{stage.desc}</p>
              
              {i < stages.length - 1 && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-px bg-white/30">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-white/30 rotate-45" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="order-1 md:order-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
          <GitBranch className="w-4 h-4" />
          <span className="text-sm">Step 4</span>
        </div>
        <h3 className="text-4xl font-bold mb-4">Agentic Workflow</h3>
        <p className="text-lg text-white/70 mb-6">
          AI agents collaborate to process, analyze, and synthesize information. 
          Each agent specializes in a specific task for optimal results.
        </p>
        <ul className="space-y-3">
          {['Multi-agent coordination', 'Specialized processing', 'Quality validation'].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-white/60">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Feature 5: Deploy & Scale
const DeployFeature = () => {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
          <Cloud className="w-4 h-4" />
          <span className="text-sm">Step 5</span>
        </div>
        <h3 className="text-4xl font-bold mb-4">Deploy & Scale</h3>
        <p className="text-lg text-white/70 mb-6">
          Production-ready infrastructure that scales automatically. 
          From prototype to millions of users with zero configuration.
        </p>
        <ul className="space-y-3">
          {['Auto-scaling', 'Global CDN', 'Zero downtime'].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-white/60">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="perspective-1500 h-96 relative flex items-center justify-center">
        {/* Docker container */}
        <div 
          className="absolute w-32 h-32 glass rounded-lg flex items-center justify-center animate-rotate-3d"
          style={{ animation: 'rotate-3d 20s linear infinite' }}
        >
          <span className="text-4xl">🐳</span>
        </div>

        {/* Database cards */}
        <div 
          className="absolute w-40 h-24 glass rounded-lg flex items-center justify-center left-0"
          style={{ 
            animation: 'rotate-3d 25s linear infinite reverse',
            transformOrigin: 'center',
          }}
        >
          <span className="text-3xl">🗄️</span>
        </div>

        {/* Cloud deployment */}
        <div 
          className="absolute w-40 h-24 glass rounded-lg flex items-center justify-center right-0"
          style={{ 
            animation: 'rotate-3d 30s linear infinite',
            transformOrigin: 'center',
          }}
        >
          <span className="text-3xl animate-glow-pulse">☁️</span>
        </div>
      </div>
    </div>
  );
};

export default Features3D;
