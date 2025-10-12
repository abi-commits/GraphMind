import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Document {
  id: number;
  name: string;
  size: string;
  status: 'processing' | 'ready';
  progress?: number;
  uploadedAt: string;
  starred: boolean;
  type: string;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const { toast } = useToast();

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    
    toast({
      title: "📄 Upload Started",
      description: `Processing ${files.length} file${files.length > 1 ? 's' : ''}...`,
    });

    files.forEach((file, index) => {
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

      // Simulate processing with toast notifications
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Variable progress
        if (progress >= 100) {
          clearInterval(interval);
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id ? { ...doc, status: 'ready', progress: 100 } : doc
          ));
          toast({
            title: "✅ Upload Complete",
            description: `${file.name} is ready for queries!`,
          });
        } else {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id ? { ...doc, progress: Math.min(progress, 100) } : doc
          ));
        }
      }, 300);
    });
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