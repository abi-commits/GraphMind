import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, Server, Database, Zap, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [healthData, setHealthData] = useState<any>(null);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const startTime = Date.now();
      const health = await apiClient.checkHealth();
      const responseTimeMs = Date.now() - startTime;
      
      setIsConnected(true);
      setResponseTime(responseTimeMs);
      setHealthData(health);
      
      // Warn if backend is slow
      if (responseTimeMs > 3000) {
        toast({
          title: "⚠️ Slow Backend Response",
          description: `Backend responded in ${responseTimeMs}ms. Performance may be degraded.`,
        });
      }
    } catch (error) {
      setIsConnected(false);
      setHealthData(null);
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

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-400';
    if (!isConnected) return 'text-red-400';
    if (responseTime > 2000) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getHealthStatus = () => {
    if (!healthData?.components) return null;
    
    const components = healthData.components;
    const allHealthy = Object.values(components).every((status: any) => status === 'healthy');
    
    return {
      redis: components.redis === 'healthy',
      taskManager: components.task_manager === 'healthy',
      workflowManager: components.workflow_manager === 'healthy',
      allHealthy
    };
  };

  const healthStatus = getHealthStatus();

  return (
    <div 
      className={`flex items-center gap-3 cursor-pointer transition-colors ${getStatusColor()} hover:opacity-80 ${className}`}
      onClick={handleRetryConnection}
      title={`Backend ${isConnected ? 'connected' : 'disconnected'}${responseTime > 0 ? ` (${responseTime}ms)` : ''} - Click to refresh`}
    >
      <div className="flex items-center gap-2">
        {isChecking ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isConnected ? (
          <Server className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isConnected ? 'Backend' : 'Disconnected'}
        </span>
      </div>

      {/* Response Time Indicator */}
      {isConnected && responseTime > 0 && (
        <div className="flex items-center gap-1">
          <Zap className={`w-3 h-3 ${responseTime > 1000 ? 'text-yellow-400' : 'text-green-400'}`} />
          <span className="text-xs font-mono">{responseTime}ms</span>
        </div>
      )}

      {/* Health Status Indicators */}
      {healthStatus && (
        <div className="flex items-center gap-1">
          {!healthStatus.allHealthy && (
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
          )}
          <div className="flex gap-1">
            <div className={`w-2 h-2 rounded-full ${healthStatus.redis ? 'bg-green-400' : 'bg-red-400'}`} title="Redis Status" />
            <div className={`w-2 h-2 rounded-full ${healthStatus.taskManager ? 'bg-green-400' : 'bg-red-400'}`} title="Task Manager Status" />
            <div className={`w-2 h-2 rounded-full ${healthStatus.workflowManager ? 'bg-green-400' : 'bg-red-400'}`} title="Workflow Manager Status" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;