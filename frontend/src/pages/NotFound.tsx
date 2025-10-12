import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-[#1a1a2e]">
      <header className="w-full px-6 py-4 flex items-center justify-center">
        <Logo size={40} />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="glass rounded-3xl p-12 max-w-lg w-full text-center border border-white/10 shadow-xl animate-fade-in">
          <div className="mb-6">
            <span className="text-7xl font-extrabold text-glow block mb-2">404</span>
            <h1 className="text-3xl font-bold mb-2 text-white">Page Not Found</h1>
            <p className="text-lg text-white/60 mb-6">Sorry, the page you are looking for does not exist or has been moved.</p>
          </div>
          <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-4 text-lg" onClick={() => window.location.href = "/"}>
            Return to Home
          </Button>
        </div>
      </main>
      <footer className="w-full py-6 text-center text-white/30 text-xs">
        &copy; {new Date().getFullYear()} GraphMind. All rights reserved.
      </footer>
    </div>
  );
};

export default NotFound;
