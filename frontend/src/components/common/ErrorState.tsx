import React from 'react';
import { AlertCircle, WifiOff, FileX, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  type: 'connection' | 'no-results' | 'no-documents' | 'api-error';
  title: string;
  description: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  type, 
  title, 
  description, 
  onRetry, 
  className = '' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'connection':
        return <WifiOff className="w-12 h-12 text-red-400" />;
      case 'no-results':
        return <Search className="w-12 h-12 text-gray-400" />;
      case 'no-documents':
        return <FileX className="w-12 h-12 text-gray-400" />;
      case 'api-error':
        return <AlertCircle className="w-12 h-12 text-red-400" />;
      default:
        return <AlertCircle className="w-12 h-12 text-gray-400" />;
    }
  };

  const getActionButton = () => {
    if (!onRetry) return null;

    const buttonText = type === 'connection' ? 'Retry Connection' : 'Try Again';
    
    return (
      <Button 
        onClick={onRetry} 
        variant="outline" 
        className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        {buttonText}
      </Button>
    );
  };

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        {getIcon()}
        <h3 className="text-lg font-semibold text-white mt-4 mb-2">
          {title}
        </h3>
        <p className="text-gray-400 mb-4 max-w-md">
          {description}
        </p>
        {getActionButton()}
      </CardContent>
    </Card>
  );
};

export default ErrorState;