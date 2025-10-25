import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, Database, Cpu } from 'lucide-react';
import { apiClient, HealthResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ApiHealthDashboardProps {
  className?: string;
}

export const ApiHealthDashboard: React.FC<ApiHealthDashboardProps> = ({ className = '' }) => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const health = await apiClient.checkHealth();
      setHealthData(health);
      setLastChecked(new Date());
      
      if (health.status !== 'healthy') {
        toast({
          title: "⚠️ Backend Issues",
          description: "Some backend components are unhealthy",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "❌ Health Check Failed",
        description: "Unable to connect to backend",
        variant: "destructive"
      });
      setHealthData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'api': return <Server className="w-4 h-4" />;
      case 'redis': return <Database className="w-4 h-4" />;
      case 'task_manager': return <Cpu className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-white">Backend Health</CardTitle>
          <CardDescription className="text-gray-400">
            {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Not checked yet'}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkHealth}
          disabled={isLoading}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {healthData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Overall Status</span>
              <Badge 
                className={`${getStatusColor(healthData.status)} text-white`}
              >
                {healthData.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Components</h4>
              {Object.entries(healthData.components).map(([component, status]) => (
                <div key={component} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getComponentIcon(component)}
                    <span className="text-gray-400 capitalize">{component.replace('_', ' ')}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(status)} text-white border-transparent`}
                  >
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-gray-500">
              Version: {healthData.version}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-400">Unable to connect to backend</div>
            <div className="text-xs text-gray-500 mt-1">
              Make sure the backend server is running on localhost:8000
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiHealthDashboard;