import { useState, useCallback } from 'react';
import { QueryRequest, QueryResponse, ProcessingStatus } from '@/types';
import { graphmindAPI } from '@/lib/api';

export const useQuery = () => {
  const [status, setStatus] = useState<ProcessingStatus>({ status: 'idle' });
  const [data, setData] = useState<QueryResponse | null>(null);

  const executeQuery = useCallback(async (request: QueryRequest) => {
    setStatus({ status: 'processing', message: 'Processing your query...' });
    
    try {
      const response = await graphmindAPI.processQuery(request);
      setData(response.data);
      
      if (response.data.success) {
        setStatus({ status: 'success', message: 'Query completed successfully' });
      } else {
        setStatus({ 
          status: 'error', 
          message: response.data.error || 'Query failed' 
        });
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
      setStatus({ status: 'error', message: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus({ status: 'idle' });
    setData(null);
  }, []);

  return {
    executeQuery,
    status,
    data,
    reset,
    isLoading: status.status === 'processing',
    isError: status.status === 'error',
    isSuccess: status.status === 'success',
  };
};
