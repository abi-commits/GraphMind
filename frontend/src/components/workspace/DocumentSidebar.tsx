import React from 'react';
import { FileText, Star, Eye, MoreVertical, Loader, Upload, Sparkles, Zap, BookOpen, Menu, X, MessageSquarePlus } from 'lucide-react';
import { Document } from '@/hooks/useDocuments';
import Logo from '@/components/Logo';

interface DocumentSidebarProps {
  documents: Document[];
  filteredDocs: Document[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onUploadClick: () => void;
  onToggleStar: (id: number) => void;
  onPreviewDocument: (doc: Document) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFilesChange: (files: File[]) => void;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChatSession?: () => void;
  isDragActive?: boolean;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  documents,
  filteredDocs,
  activeFilter,
  setActiveFilter,
  onUploadClick,
  onToggleStar,
  onPreviewDocument,
  fileInputRef,
  onFilesChange,
  isCollapsed = false,
  onToggleSidebar,
  onNewChatSession,
  isDragActive = false,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop
}) => {
  return (
    <div 
      className={`${
        isCollapsed ? 'w-16' : 'w-80'
      } bg-black/60 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out ${
        isDragActive ? 'bg-blue-500/20 border-blue-400/50' : ''
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* GraphMind Logo Header with Separate Toggle */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          {isCollapsed ? (
            /* Collapsed State - Show toggle icon only */
            <button 
              onClick={onToggleSidebar}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
              title="Expand Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            /* Expanded State - Show logo and toggle */
            <>
              <div 
                onClick={onNewChatSession}
                className="cursor-pointer transition-all duration-200 hover:scale-105 flex-1"
                title="Start New Chat Session"
              >
                <Logo />
              </div>
              <div className="flex gap-2 ml-4">
                <button 
                  onClick={onNewChatSession}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
                  title="New Chat Session"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                </button>
                <button 
                  onClick={onToggleSidebar}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
                  title="Collapse Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Documents Section - Hidden when collapsed */}
      {!isCollapsed && (
        <>
          <div className="p-6 border-b border-white/10">
            <div className="mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                DOCUMENTS
              </h2>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => onFilesChange(Array.from(e.target.files || []))}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {['all', 'recent', 'starred'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    activeFilter === filter 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {filter === 'all' && '☑ All'}
                  {filter === 'recent' && '🕐 Recent'}
                  {filter === 'starred' && '⭐ Starred'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Document List or Collapsed State */}
      <div className="flex-1 overflow-y-auto">
        {isCollapsed ? (
          /* Collapsed Sidebar - Quick Icons Only */
          <div className="p-4 space-y-4">
            {filteredDocs.slice(0, 8).map(doc => (
              <div
                key={doc.id}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all duration-200"
                title={doc.name}
                onClick={() => onPreviewDocument(doc)}
              >
                <FileText className="w-4 h-4 text-white/60" />
              </div>
            ))}
            {filteredDocs.length > 8 && (
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-xs text-white/40">
                +{filteredDocs.length - 8}
              </div>
            )}
          </div>
        ) : (
          /* Full Sidebar Content */
          <div className="p-4 space-y-2">
            {/* Drag & Drop Zone */}
            {isDragActive && (
              <div className="border-2 border-dashed border-blue-400/50 bg-blue-500/10 rounded-xl p-8 text-center mb-4">
                <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Drop Files Here</h3>
                <p className="text-sm text-blue-400/80">Release to upload your documents</p>
              </div>
            )}

            {filteredDocs.length === 0 ? (
              /* Empty State with Drag & Drop */
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div 
                  className={`relative mb-6 transition-all duration-300 ${
                    isDragActive ? 'scale-110' : ''
                  }`}
                >
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4 mx-auto border-2 border-dashed border-white/20 hover:border-white/40 transition-all duration-300">
                    <Upload className="w-10 h-10 text-white/30" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white/60" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-white/80">Drag & Drop Files Here</h3>
                <p className="text-sm text-white/40 mb-6 max-w-48 leading-relaxed">
                  Drop your documents anywhere in this area to start building your knowledge base.
                </p>
                
                <button 
                  onClick={onUploadClick}
                  className="group flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  <Upload className="w-4 h-4 group-hover:animate-bounce" />
                  Or Click to Browse
                </button>
                
                <div className="flex items-center gap-4 mt-6 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    PDF & DOCX
                  </span>
                  <span>•</span>
                  <span>Max 5GB</span>
                  <span>•</span>
                  <span>AI Ready</span>
                </div>
              </div>
            ) : (
              /* Document List */
              filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="group p-4 bg-white/3 border border-white/15 rounded-lg hover:bg-white/5 hover:border-white/30 transition-all duration-300 hover:translate-x-1 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-white/60 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{doc.name}</span>
                      </div>
                      <div className="text-xs text-white/40">{doc.size} • {doc.uploadedAt}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(doc.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star className={`w-4 h-4 ${doc.starred ? 'fill-white text-white' : 'text-white/40'}`} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewDocument(doc);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-4 h-4 text-white/40 hover:text-white/60" />
                      </button>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-white/40" />
                      </button>
                    </div>
                  </div>

                  {doc.status === 'processing' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Loader className="w-3 h-3 animate-spin" />
                        {doc.progress === 0 && 'Starting upload...'}
                        {doc.progress > 0 && doc.progress < 30 && 'Uploading...'}
                        {doc.progress >= 30 && doc.progress < 35 && 'Upload complete'}
                        {doc.progress >= 35 && doc.progress < 60 && 'Analyzing content...'}
                        {doc.progress >= 60 && doc.progress < 80 && 'Creating embeddings...'}
                        {doc.progress >= 80 && doc.progress < 100 && 'Building knowledge graph...'}
                        {doc.progress >= 100 && 'Finalizing...'}
                        {' '}({doc.progress}%)
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                          style={{ width: `${doc.progress}%` }}
                        />
                      </div>
                      {doc.progress > 0 && doc.progress < 100 && (
                        <div className="text-xs text-white/40 text-center">
                          This may take a few minutes for large documents
                        </div>
                      )}
                    </div>
                  ) : doc.status === 'failed' ? (
                    <div className="space-y-2">
                      <div className="text-xs text-red-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        Processing failed
                      </div>
                      <button 
                        onClick={() => window.location.reload()}
                        className="w-full px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-xs font-medium text-red-300 transition-all duration-300"
                      >
                        Retry Upload
                      </button>
                    </div>
                  ) : (
                    <button className="w-full mt-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-all duration-300 hover:scale-105">
                      Query This Document
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSidebar;