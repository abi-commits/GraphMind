import './globals.css';
import { Inter } from 'next/font/google';
// import { ThemeProvider } from '@/lib/theme';
// import { ThemeToggle } from '@/components/ui/ThemeToggle';
import NextAuthSessionProvider from "@/app/SessionProvider";
import ParallaxEffect from '@/components/ParallaxEffect';
import MotionBackground from '@/components/MotionBackground';
import FloatingShapesBackground from '@/components/FloatingShapesBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GraphMind - Transform documents into knowledge graphs',
  description: 'AI-powered document analysis and knowledge graph extraction',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <div className="min-h-screen bg-background parallax-bg dark">
              {/* Subtle animated floating shapes background */}
              <FloatingShapesBackground />
              {/* Subtle animated motion background (waves) */}
              <MotionBackground />
              {/* Gradient background overlay */}
              <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 via-secondary-50/10 to-accent-50/20 dark:from-primary-950/20 dark:via-secondary-950/10 dark:to-accent-950/20" />
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
                {/* Mesh gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-200/30 via-secondary-200/20 to-accent-200/10 dark:from-primary-900/30 dark:via-secondary-900/20 dark:to-accent-900/10 pointer-events-none" />
                {/* Floating geometric shapes */}
                <div className="absolute left-10 top-1/3 w-16 h-16 bg-gradient-to-tr from-primary-400/40 to-accent-400/30 rounded-full blur-2xl animate-float" />
                <div className="absolute right-20 bottom-1/4 w-24 h-24 bg-gradient-to-br from-secondary-400/40 to-primary-400/30 rounded-2xl blur-2xl animate-float animation-delay-1000" />
                <div className="absolute left-1/2 top-10 w-10 h-10 bg-gradient-to-br from-accent-400/40 to-secondary-400/30 rounded-full blur-2xl animate-float animation-delay-2000" />
              </div>
              
              {/* Parallax floating shapes */}
              <div className="parallax-shape left-10 top-1/3 w-16 h-16 bg-gradient-to-tr from-primary-400/40 to-accent-400/30 rounded-full blur-2xl" style={{ zIndex: 0 }} />
              <div className="parallax-shape right-20 bottom-1/4 w-24 h-24 bg-gradient-to-br from-secondary-400/40 to-primary-400/30 rounded-2xl blur-2xl" style={{ zIndex: 0 }} />
              <div className="parallax-shape left-1/2 top-10 w-10 h-10 bg-gradient-to-br from-accent-400/40 to-secondary-400/30 rounded-full blur-2xl" style={{ zIndex: 0 }} />
              
              <header className="relative shadow-lg border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center group">
                        <Brain className="h-8 w-8 text-primary transition-colors group-hover:text-primary/80" />
                        <span className="ml-2 text-xl font-bold gradient-text">
                          GraphMind
                        </span>
                      </div>
                      <nav className="ml-8 flex space-x-8">
                        <a
                          href="/"
                          className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors relative group"
                        >
                          Home
                          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
                        </a>
                        <a
                          href="/query"
                          className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors relative group"
                        >
                          Query
                          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
                        </a>
                      </nav>
                    </div>
                    
                    {/* Theme switch removed: always dark mode */}
                  </div>
                </div>
              </header>
              
              <main className="relative">{children}</main>
              <ParallaxEffect />
            </div>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}

// Animated Brain icon with glow and pulse
const Brain = ({ className }: { className?: string }) => (
  <svg
    className={className + " animate-brain-glow"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 64 64"
    width="40"
    height="40"
  >
    <defs>
      <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
      </radialGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <ellipse cx="32" cy="32" rx="28" ry="18" fill="url(#brainGlow)" filter="url(#glow)" />
    <path
      d="M24 44c-6-2-10-8-10-14 0-8 8-14 18-14s18 6 18 14c0 6-4 12-10 14"
      stroke="#6366f1"
      strokeWidth="2.5"
      fill="none"
      filter="url(#glow)"
    />
    <path
      d="M32 18v4m0 20v4m-8-8h16"
      stroke="#0ea5e9"
      strokeWidth="2"
      strokeLinecap="round"
      filter="url(#glow)"
    />
    <circle cx="32" cy="32" r="3" fill="#a5b4fc" filter="url(#glow)" />
  </svg>
);

// Add keyframes for brain-glow animation in globals.css:
// @keyframes brain-glow { 0%,100%{ filter: drop-shadow(0 0 16px #7dd3fc88); } 50%{ filter: drop-shadow(0 0 32px #6366f1cc); } }
// .animate-brain-glow { animation: brain-glow 2.5s ease-in-out infinite; }