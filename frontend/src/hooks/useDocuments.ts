import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient, DocumentProcessRequest, TaskStatusResponse } from '@/lib/api';

export interface Document {
  id: number;
  name: string;
  size: string;
  status: 'processing' | 'ready' | 'failed';
  progress?: number;
  uploadedAt: string;
  starred: boolean;
  type: string;
  taskId?: string;
  filePath?: string;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const { toast } = useToast();

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    toast({
      title: "📄 Upload Started",
      description: `Processing ${files.length} file${files.length > 1 ? 's' : ''}...`,
    });

    for (const [index, file] of files.entries()) {
      const newDoc: Document = {
        id: Date.now() + index,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        status: 'processing',
        progress: 0,
        uploadedAt: 'Just now',
        starred: false,
        type: file.type || 'application/pdf'
      };
      
      setDocuments(prev => [...prev, newDoc]);

      try {
        // Step 1: Upload file to S3 with progress tracking
        toast({
          title: "📤 Uploading...",
          description: `Uploading ${file.name} to cloud storage`,
        });

        const uploadResponse = await apiClient.uploadDocument(file, (progress) => {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id ? { 
              ...doc, 
              progress: Math.round(progress * 0.3) // Upload is 30% of total progress
            } : doc
          ));
        });
        
        if (!uploadResponse.success) {
          throw new Error('File upload failed');
        }

        // Update document with upload info
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id ? { 
            ...doc, 
            progress: 30, // Upload complete
            filePath: uploadResponse.s3_key 
          } : doc
        ));

        toast({
          title: "🔄 Processing Document...",
          description: `Analyzing content of ${file.name}`,
        });

        // Step 2: Process the uploaded document
        const processRequest: DocumentProcessRequest = {
          s3_key: uploadResponse.s3_key,
          chunk_size: 1000,
          chunk_overlap: 200,
          process_in_background: true
        };

        const response = await apiClient.processDocument(processRequest);

        if (response.success && response.task_id) {
          // Update document with task ID
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id ? { 
              ...doc, 
              taskId: response.task_id,
              progress: 35 // Processing started
            } : doc
          ));

          // Poll for task completion with faster intervals
          pollTaskStatus(newDoc.id, response.task_id, file.name);
        } else if (response.success && !response.task_id) {
          // Synchronous processing completed
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id ? { ...doc, status: 'ready', progress: 100 } : doc
          ));
          
          toast({
            title: "✅ Processing Complete",
            description: `${file.name} is ready for queries!`,
          });
        } else {
          throw new Error(response.error || 'Processing failed');
        }
      } catch (error) {
        console.error('Document processing error:', error);
        
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id ? { ...doc, status: 'failed', progress: 0 } : doc
        ));
        
        toast({
          title: "❌ Processing Failed",
          description: `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    }
  };

  const pollTaskStatus = async (docId: number, taskId: string, fileName?: string) => {
    const maxPolls = 120; // 10 minutes max
    let pollCount = 0;

    const poll = async () => {
      try {
        const taskStatus: TaskStatusResponse = await apiClient.getTaskStatus(taskId);
        
        // Better progress mapping
        let mappedProgress = taskStatus.progress || 35;
        if (taskStatus.progress) {
          // Map backend progress (0-100) to frontend progress (35-100)
          mappedProgress = 35 + (taskStatus.progress * 0.65);
        }
        
        setDocuments(prev => prev.map(doc => 
          doc.id === docId ? { 
            ...doc, 
            progress: Math.round(mappedProgress),
            status: taskStatus.status === 'completed' ? 'ready' : 
                   taskStatus.status === 'failed' ? 'failed' : 'processing'
          } : doc
        ));

        if (taskStatus.status === 'completed') {
          setDocuments(prev => prev.map(doc => 
            doc.id === docId ? { ...doc, progress: 100 } : doc
          ));
          toast({
            title: "✅ Processing Complete",
            description: `${fileName || 'Document'} is ready for queries!`,
          });
          return;
        } else if (taskStatus.status === 'failed') {
          toast({
            title: "❌ Processing Failed",
            description: taskStatus.error || `Failed to process ${fileName || 'document'}`,
            variant: "destructive"
          });
          return;
        }

        // Continue polling if still processing
        pollCount++;
        if (pollCount < maxPolls) {
          // Faster polling initially, then slower
          const pollInterval = pollCount < 20 ? 2000 : pollCount < 60 ? 3000 : 5000;
          setTimeout(poll, pollInterval);
        } else {
          // Timeout
          setDocuments(prev => prev.map(doc => 
            doc.id === docId ? { ...doc, status: 'failed' } : doc
          ));
          toast({
            title: "⏰ Processing Timeout",
            description: `${fileName || 'Document'} processing took too long`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Task polling error:', error);
        
        setDocuments(prev => prev.map(doc => 
          doc.id === docId ? { ...doc, status: 'failed' } : doc
        ));
        
        toast({
          title: "❌ Task Polling Failed",
          description: `Failed to check status for ${fileName || 'document'}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    };

    poll();
  };

  const toggleStar = (id: number) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, starred: !doc.starred } : doc
    ));
  };

  const filteredDocs = documents.filter(doc => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'recent') return doc.uploadedAt.includes('min') || doc.uploadedAt.includes('Just');
    if (activeFilter === 'starred') return doc.starred;
    return true;
  });

  return {
    documents,
    filteredDocs,
    activeFilter,
    setActiveFilter,
    handleFiles,
    toggleStar
  };
};