import React, { useState } from 'react';
import { FileText, X, Download, Search, Trash2, Share2, Eye, Clock, FileCheck, Info, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader } from 'lucide-react';
import { Document as DocumentType } from '@/hooks/useDocuments';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentPreviewProps {
  document: DocumentType | null;
  onClose: () => void;
  onQueryDocument: (documentName: string) => void;
  onDelete?: (documentId: string) => void;
  documentUrl?: string; // URL or base64 string of the PDF
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onClose,
  onQueryDocument,
  onDelete,
  documentUrl
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'info'>('preview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!document) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete "${document.name}"?`);
    if (confirmed) {
      setIsDeleting(true);
      try {
        await onDelete(document.id.toString());
        onClose();
      } catch (error) {
        console.error('Error deleting document:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleDownload = () => {
    if (documentUrl) {
      const link = window.document.createElement('a');
      link.href = documentUrl;
      link.download = document.name;
      link.click();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl h-[90vh] bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <FileText className="w-6 h-6 text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{document.name}</h2>
              <div className="flex items-center gap-3 text-sm text-white/40 mt-1">
                <span className="flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" />
                  {document.size}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {document.uploadedAt}
                </span>
                {numPages && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {numPages} pages
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 ml-4"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-200 ${
              activeTab === 'preview'
                ? 'bg-white/10 text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium">Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-200 ${
              activeTab === 'info'
                ? 'bg-white/10 text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="font-medium">Details</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'preview' ? (
            <div className="h-full flex flex-col">
              {/* PDF Controls */}
              {documentUrl && !error && (
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/20">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={pageNumber <= 1}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-white/80 px-3">
                      Page {pageNumber} {numPages && `of ${numPages}`}
                    </span>
                    <button
                      onClick={goToNextPage}
                      disabled={!numPages || pageNumber >= numPages}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={zoomOut}
                      disabled={scale <= 0.5}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-white/80 px-3 min-w-[4rem] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={zoomIn}
                      disabled={scale >= 2.0}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PDF Viewer */}
              <div className="flex-1 overflow-auto p-6 bg-white/5">
                {loading && documentUrl && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader className="w-12 h-12 animate-spin text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">Loading PDF...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-red-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Error Loading PDF</h3>
                      <p className="text-white/50 mb-4">{error}</p>
                    </div>
                  </div>
                )}

                {!documentUrl && !error && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="w-32 h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/10 shadow-xl">
                        <FileText className="w-16 h-16 text-white/40" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-white">PDF Preview Ready</h3>
                      <p className="text-white/50 mb-6 leading-relaxed">
                        Connect your document storage to enable PDF preview. The component is configured to use 
                        <span className="text-white/70 font-semibold"> react-pdf</span> for rendering.
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                        <FileCheck className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/60">Ready to display PDFs</span>
                      </div>
                    </div>
                  </div>
                )}

                {documentUrl && !error && (
                  <div className="flex justify-center">
                    <PDFDocument
                      file={documentUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center p-12">
                          <Loader className="w-8 h-8 animate-spin text-white/40" />
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-2xl"
                      />
                    </PDFDocument>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Document Information */}
                <div className="glass rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold mb-4 text-white">Document Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/60">File Name</span>
                      <span className="text-white font-medium">{document.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/60">File Size</span>
                      <span className="text-white font-medium">{document.size}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/60">Upload Date</span>
                      <span className="text-white font-medium">{document.uploadedAt}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/60">Status</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-sm font-medium">
                        <FileCheck className="w-3.5 h-3.5" />
                        Processed
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-white/60">Document ID</span>
                      <span className="text-white/40 font-mono text-sm">{document.id}</span>
                    </div>
                  </div>
                </div>

                {/* Processing Details */}
                <div className="glass rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold mb-4 text-white">Processing Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/5 rounded-lg mt-0.5">
                        <FileCheck className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white/90">Extracted & Indexed</div>
                        <div className="text-sm text-white/50 mt-0.5">Document content has been processed and added to knowledge graph</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/5 rounded-lg mt-0.5">
                        <Search className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white/90">Searchable</div>
                        <div className="text-sm text-white/50 mt-0.5">Ready for semantic search and queries</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-black/40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                aria-label="Download document"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                aria-label="Share document"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              {onDelete && (
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              )}
            </div>
            <button 
              onClick={() => {
                onClose();
                onQueryDocument(document.name);
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-white/90 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              aria-label="Query this document"
            >
              <Search className="w-4 h-4" />
              Query Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;