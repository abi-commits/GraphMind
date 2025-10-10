// Animated SVG for Upload feature
export function AnimatedUploadIcon({ className = "" }) {
  return (
    <svg className={className + " animate-upload-bounce"} viewBox="0 0 48 48" fill="none" width="40" height="40">
      <defs>
        <radialGradient id="uploadGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="24" rx="20" ry="12" fill="url(#uploadGlow)" />
      <rect x="18" y="28" width="12" height="8" rx="2" fill="#38bdf8" />
      <path d="M24 32V16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 20l4-4 4 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Animated SVG for Query feature
export function AnimatedQueryIcon({ className = "" }) {
  return (
    <svg className={className + " animate-query-pulse"} viewBox="0 0 48 48" fill="none" width="40" height="40">
      <defs>
        <radialGradient id="queryGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="24" rx="20" ry="12" fill="url(#queryGlow)" />
      <circle cx="24" cy="22" r="7" fill="#a78bfa" />
      <rect x="22" y="30" width="4" height="6" rx="2" fill="#fff" />
      <circle cx="24" cy="38" r="1.5" fill="#fff" />
    </svg>
  );
}

// Animated SVG for Graph feature
export function AnimatedGraphIcon({ className = "" }) {
  return (
    <svg className={className + " animate-graph-glow"} viewBox="0 0 48 48" fill="none" width="40" height="40">
      <defs>
        <radialGradient id="graphGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="24" rx="20" ry="12" fill="url(#graphGlow)" />
      <circle cx="24" cy="24" r="6" fill="#34d399" />
      <circle cx="36" cy="18" r="3" fill="#06b6d4" />
      <circle cx="12" cy="18" r="3" fill="#06b6d4" />
      <line x1="24" y1="24" x2="36" y2="18" stroke="#fff" strokeWidth="2" />
      <line x1="24" y1="24" x2="12" y2="18" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
