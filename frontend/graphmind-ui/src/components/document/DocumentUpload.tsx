'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';

export const DocumentUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadDocument, status, uploadProgress, reset } = useDocumentUpload();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadDocument(selectedFile);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card hover glow>
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Document
          </h2>
          <p className="text-sm text-muted-foreground">Upload PDF documents to build your knowledge base</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            } ${
              status.status === 'processing' ? 'opacity-50' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={status.status === 'processing'}
            />
            
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <span className="text-lg font-medium text-foreground">
                Drag and drop your PDF here
              </span>
              <span className="text-sm text-muted-foreground mt-2">
                or click to browse files
              </span>
            </label>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={status.status === 'processing'}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Upload Progress */}
          {status.status === 'processing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing document...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Messages */}
          {status.message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                status.status === 'success'
                  ? 'bg-success/10 text-success-foreground border border-success/20'
                  : status.status === 'error'
                  ? 'bg-error/10 text-error-foreground border border-error/20'
                  : 'bg-primary/10 text-primary-foreground border border-primary/20'
              }`}
            >
              {status.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="gradient"
              onClick={handleUpload}
              disabled={!selectedFile || status.status === 'processing'}
              loading={status.status === 'processing'}
              className="flex-1"
            >
              {status.status === 'processing' ? 'Processing...' : 'Process Document'}
            </Button>
            
            {(status.status === 'success' || status.status === 'error') && (
              <Button variant="outline" onClick={handleReset}>
                Upload Another
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};