import React, { useRef, useState } from 'react';
import { Network } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useQuery } from '@/hooks/useQuery';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useSidebar } from '@/hooks/useSidebar';
import DocumentSidebar from '@/components/workspace/DocumentSidebar';
import SearchInput from '@/components/workspace/SearchInput';
import ResultsArea from '@/components/workspace/ResultsArea';
import GraphView from '@/components/workspace/GraphView';
import DocumentPreview from '@/components/workspace/DocumentPreview';
import type { Document } from '@/types/document';

const Workspace = () => {
  const [showGraph, setShowGraph] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const {
    documents,
    filteredDocs,
    activeFilter,
    setActiveFilter,
    handleFiles,
    toggleStar
  } = useDocuments();

  const {
    isCollapsed,
    toggleSidebar,
    isDragActive,
    dragHandlers
  } = useSidebar(handleFiles);

  const {
    query,
    setQuery,
    results,
    isQuerying,
    handleQuery
  } = useQuery();

  const {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragAndDrop(handleFiles);

  // Event handlers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChange = (files: File[]) => {
    handleFiles(files);
  };

  const handlePreviewDocument = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const handleClosePreview = () => {
    setPreviewDocument(null);
  };

  const handleQueryDocument = (documentName: string) => {
    setQuery(`Tell me about ${documentName}`);
  };

  const handleQuerySubmit = () => {
    handleQuery(documents.length);
  };

  const handleToggleGraph = () => {
    setShowGraph(!showGraph);
  };

  const handleCloseGraph = () => {
    setShowGraph(false);
  };

  const handleNewChatSession = () => {
    // Clear current query and results for new chat session
    setQuery('');
    // You can add more reset logic here as needed
    console.log('Starting new chat session...');
  };

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      {/* Enhanced Sidebar with Drag & Drop and Toggle */}
      <DocumentSidebar
        documents={documents}
        filteredDocs={filteredDocs}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onUploadClick={handleUploadClick}
        onToggleStar={toggleStar}
        onPreviewDocument={handlePreviewDocument}
        fileInputRef={fileInputRef}
        onFilesChange={handleFilesChange}
        isCollapsed={isCollapsed}
        onToggleSidebar={toggleSidebar}
        onNewChatSession={handleNewChatSession}
        isDragActive={isDragActive}
        {...dragHandlers}
      />

      {/* Main Area - Responsive to sidebar state */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'ml-0' : 'ml-0'
      }`}>
        {/* Top Input Zone */}
        <SearchInput
          query={query}
          setQuery={setQuery}
          onQuery={handleQuerySubmit}
          isQuerying={isQuerying}
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        {/* Results Area */}
        <ResultsArea
          results={results}
          isQuerying={isQuerying}
          documentsCount={documents.length}
          onShowGraph={handleToggleGraph}
          showGraph={showGraph}
        />
      </div>

      {/* Modals */}
      <GraphView
        showGraph={showGraph}
        onClose={handleCloseGraph}
      />

      <DocumentPreview
        document={previewDocument}
        onClose={handleClosePreview}
        onQueryDocument={handleQueryDocument}
      />
    </div>
  );
};

const UploadAndQuery = Workspace;
export default UploadAndQuery;