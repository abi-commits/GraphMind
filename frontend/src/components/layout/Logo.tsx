interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

const Logo = ({ size = 32, className = "", showText = true }: LogoProps) => {
  const nodeRadius = size * 0.08;
  const centerRadius = size * 0.12;
  const orbitRadius = size * 0.35;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="relative"
        style={{ filter: 'drop-shadow(0 0 8px hsl(0 0% 100% / 0.3))' }}
      >
        {/* Central hub with pulsing glow */}
        <circle
          cx="50"
          cy="50"
          r={centerRadius * 2}
          fill="hsl(0 0% 100%)"
          className="animate-glow-pulse"
        />
        
        {/* Connecting lines to outer nodes */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const x = 50 + orbitRadius * 2 * Math.cos((angle * Math.PI) / 180);
          const y = 50 + orbitRadius * 2 * Math.sin((angle * Math.PI) / 180);
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="hsl(0 0% 100% / 0.3)"
              strokeWidth="1"
              className="transition-all duration-300"
            />
          );
        })}

        {/* Outer nodes */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const x = 50 + orbitRadius * 2 * Math.cos((angle * Math.PI) / 180);
          const y = 50 + orbitRadius * 2 * Math.sin((angle * Math.PI) / 180);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={nodeRadius * 2}
              fill="hsl(0 0% 100%)"
              opacity="0.8"
              style={{
                animation: `glow-pulse 3s ease-in-out infinite ${i * 0.5}s`
              }}
            />
          );
        })}
      </svg>
      
      {showText && (
        <span className="text-xl font-bold tracking-tight text-foreground">
          GraphMind
        </span>
      )}
    </div>
  );
};

export default Logo;
