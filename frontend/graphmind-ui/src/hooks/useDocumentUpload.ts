import { useState, useCallback } from 'react';
import { ProcessingStatus } from '@/types';
import { graphmindAPI } from '@/lib/api';

export const useDocumentUpload = () => {
  const [status, setStatus] = useState<ProcessingStatus>({ status: 'idle' });
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadDocument = useCallback(async (file: File) => {
    setStatus({ status: 'processing', message: 'Uploading document...' });
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await graphmindAPI.processDocument(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setStatus({ 
        status: 'success', 
        message: 'Document processed successfully!' 
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Upload failed';
      setStatus({ status: 'error', message: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus({ status: 'idle' });
    setUploadProgress(0);
  }, []);

  return {
    uploadDocument,
    status,
    uploadProgress,
    reset,
    isLoading: status.status === 'processing',
    isError: status.status === 'error',
    isSuccess: status.status === 'success',
  };
};

// Remove default export since we already have named export