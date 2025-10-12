import React from 'react';
import { FileText, X } from 'lucide-react';
import { Document } from '@/hooks/useDocuments';

interface DocumentPreviewProps {
  document: Document | null;
  onClose: () => void;
  onQueryDocument: (documentName: string) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onClose,
  onQueryDocument
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl h-5/6 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white/60" />
            <div>
              <h2 className="text-xl font-bold text-white">{document.name}</h2>
              <p className="text-sm text-white/40">{document.size} • {document.uploadedAt}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <FileText className="w-12 h-12 text-white/30" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white/80">Document Preview</h3>
            <p className="text-sm text-white/40 mb-6 max-w-md">
              PDF preview functionality would be implemented here using a PDF viewer library like react-pdf or pdf.js.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all duration-300">
                Download
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onQueryDocument(document.name);
                }}
                className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-medium transition-all duration-300"
              >
                Query This Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;