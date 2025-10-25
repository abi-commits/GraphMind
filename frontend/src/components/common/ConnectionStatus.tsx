import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const startTime = Date.now();
      await apiClient.checkHealth();
      const responseTime = Date.now() - startTime;
      
      setIsConnected(true);
      
      // Warn if backend is slow
      if (responseTime > 3000) {
        toast({
          title: "⚠️ Slow Backend Response",
          description: `Backend responded in ${responseTime}ms. Uploads may be slower than usual.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsConnected(false);
      console.error('Backend connection failed:', error);
      
      toast({
        title: "❌ Backend Disconnected",
        description: "Cannot connect to backend. Check if the server is running.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetryConnection = () => {
    toast({
      title: "🔄 Retrying Connection",
      description: "Attempting to reconnect to backend...",
    });
    checkConnection();
  };

  if (isChecking && isConnected === null) {
    return (
      <div className={`flex items-center gap-2 text-yellow-400 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking connection...</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-2 cursor-pointer ${
        isConnected 
          ? 'text-green-400 hover:text-green-300' 
          : 'text-red-400 hover:text-red-300'
      } ${className}`}
      onClick={handleRetryConnection}
      title={isConnected ? 'Backend connected' : 'Backend disconnected - Click to retry'}
    >
      {isChecking ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isConnected ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span className="text-sm">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;