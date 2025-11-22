import React, { useRef, useState } from 'react';
import { Network, Activity, Database, Cloud, Zap } from 'lucide-react';
import { useDocuments, type Document } from '@/hooks/useDocuments';
import { useQuery } from '@/hooks/useQuery';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useSidebar } from '@/hooks/useSidebar';
import DocumentSidebar from '@/components/workspace/DocumentSidebar';
import SearchInput from '@/components/workspace/SearchInput';
import ResultsArea from '@/components/workspace/ResultsArea';
import GraphView from '@/components/workspace/GraphView';
import DocumentPreview from '@/components/workspace/DocumentPreview';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import ConnectionStatus from '@/components/common/ConnectionStatus';

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
    summary,
    knowledgeGraph,
    isQuerying,
    handleQuery
  } = useQuery();

  const {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragAndDrop(handleFiles);

  const {
    graphData,
    isLoading: isGraphLoading,
    setGraphDataFromQuery
  } = useKnowledgeGraph();

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

  const handleQuerySubmit = async () => {
    // Run the query and get visualization data directly from the hook
    const vizData = await handleQuery(documents.length);

    // Prefer the immediate returned visualization data to avoid React state timing races
    if (vizData) {
      setGraphDataFromQuery(vizData);
      // Open the graph view automatically when we have visualization data
      setShowGraph(true);
      return;
    }

    // Fallback: if the hook's knowledgeGraph state was set, use it
    if (knowledgeGraph) {
      setGraphDataFromQuery(knowledgeGraph);
    }
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
        onQueryDocument={handleQueryDocument}
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
        {/* Enhanced Status Bar */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 px-4 py-2">
          <div className="flex items-center justify-between">
            <ConnectionStatus />
            <div className="flex items-center gap-2 md:gap-4 text-xs">
              {/* Document Count */}
              <div className="flex items-center gap-1.5 text-gray-400">
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{documents.length} documents</span>
                <span className="sm:hidden">{documents.length}</span>
              </div>
              
              {/* ChromaDB Status */}
              <div className="hidden md:flex items-center gap-1.5 text-green-400">
                <Cloud className="w-3.5 h-3.5" />
                <span>ChromaDB Cloud</span>
              </div>
              
              {/* Processing Status */}
              {documents.some(doc => doc.status === 'processing') && (
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden sm:inline">Processing...</span>
                </div>
              )}
              
              {/* Knowledge Graph Ready */}
              {graphData && (
                <div className="flex items-center gap-1.5 text-purple-400">
                  <Network className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Graph Ready</span>
                </div>
              )}
            </div>
          </div>
        </div>

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
          summary={summary}
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
        graphData={graphData}
      />

      <DocumentPreview
        document={previewDocument}
        onClose={handleClosePreview}
        onQueryDocument={handleQueryDocument}
      />

      {/* Floating Action Button for Knowledge Graph (Mobile) */}
      {graphData && (
        <button
          onClick={handleToggleGraph}
          className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full shadow-lg shadow-purple-500/25 flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Toggle Knowledge Graph"
        >
          <Network className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

const UploadAndQuery = Workspace;
export default UploadAndQuery;