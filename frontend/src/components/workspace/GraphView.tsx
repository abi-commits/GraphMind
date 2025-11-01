import React, { useState } from 'react';
import { Network, X } from 'lucide-react';
import KnowledgeGraph from '@/components/graph/KnowledgeGraph';
import type { GraphNode, GraphData } from '@/types/graph';

interface GraphViewProps {
  showGraph: boolean;
  onClose: () => void;
  graphData?: GraphData | null;
}

const GraphView: React.FC<GraphViewProps> = ({ showGraph, onClose, graphData }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  if (!showGraph) return null;

  // Show empty state if no graph data
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl h-5/6 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Network className="w-16 h-16 text-white/30 mx-auto" />
              <h3 className="text-xl font-semibold text-white/80">No Knowledge Graph Available</h3>
              <p className="text-white/60 max-w-md">
                Upload documents and run a query to generate your knowledge graph visualization.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayData = graphData;
  const isUsingRealData = true;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl h-5/6 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col relative">
        {/* Close Button - Floating */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
        >
          <X className="w-5 h-5 text-white/60 hover:text-white" />
        </button>
        
        <div className="flex-1 relative overflow-hidden">
          <KnowledgeGraph 
            data={displayData} 
            onNodeSelect={setSelectedNode}
          />
        </div>

        {/* Compact Footer Design */}
        <div className="h-16 bg-gradient-to-t from-black/40 to-black/20 border-t border-white/10 backdrop-blur-xl">
          {selectedNode ? (
            /* Selected Node State */
            <div className="h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full shadow-lg animate-pulse" 
                    style={{ 
                      backgroundColor: selectedNode.type === 'document' ? '#4ecdc4' :
                                     selectedNode.type === 'concept' ? '#ff6b6b' :
                                     selectedNode.type === 'entity' ? '#00ff88' :
                                     selectedNode.type === 'topic' ? '#ffd93d' :
                                     selectedNode.type === 'keyword' ? '#c44dff' : '#ffffff'
                    }}
                  />
                  <div>
                    <h3 className="text-white font-semibold text-sm leading-tight">{selectedNode.label}</h3>
                    <p className="text-white/60 text-xs">
                      {selectedNode.type} • {
                        displayData.links.filter(link => {
                          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
                          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
                          return sourceId === selectedNode.id || targetId === selectedNode.id;
                        }).length
                      } connections
                    </p>
                  </div>
                </div>
                
                {selectedNode.description && (
                  <div className="hidden lg:block max-w-xs">
                    <p className="text-white/70 text-xs leading-relaxed truncate">
                      {selectedNode.description}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-xs font-medium text-blue-200 transition-all duration-200">
                  Focus
                </button>
                <button className="px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-xs font-medium text-white/80 transition-all duration-200">
                  Details
                </button>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg text-red-200 transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* Default State */
            <div className="h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-sm font-medium">{displayData.nodes.length} Nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-sm font-medium">{displayData.links.length} Links</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-4 py-1.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-xs font-medium text-white/80 transition-all duration-200 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 hover:text-white/70 transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Status Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
        </div>
        
        {/* Help Text */}
        <div className="px-4 py-1 bg-black/10 border-t border-white/5">
          <p className="text-center text-[10px] text-white/50">
            {selectedNode ? (
              <>Press <kbd className="bg-white/10 px-1 py-0.5 rounded text-[9px] font-mono">ESC</kbd> to deselect • Drag nodes</>
            ) : (
              <>Click nodes • Wheel zoom • Drag pan • Shift + click multi-select</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GraphView;