import React from 'react';
import { Search, FileText, Network } from 'lucide-react';
import { QueryResult } from '@/hooks/useQuery';

interface ResultsAreaProps {
  results: QueryResult[];
  isQuerying: boolean;
  documentsCount: number;
  onShowGraph: () => void;
  showGraph: boolean;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({
  results,
  isQuerying,
  documentsCount,
  onShowGraph,
  showGraph
}) => {
  if (isQuerying) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-white/10 border-t-white/60 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-6 h-6 text-white/40 animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white/80">Searching Your Knowledge</h3>
            <p className="text-sm text-white/40 text-center max-w-md">
              AI is analyzing your documents to find the most relevant information...
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-white/30">
              <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Empty Results State */}
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white/60">Ready to Search</h3>
            <p className="text-sm text-white/40 max-w-md">
              {documentsCount === 0 
                ? "Upload documents first, then ask questions to get AI-powered insights."
                : "Ask a question about your documents to get started with intelligent search."
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📊 RESULTS</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40">Found {results.length} results</span>
            <button 
              onClick={onShowGraph}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
            >
              <Network className="w-4 h-4" />
              {showGraph ? 'Hide' : 'Show'} Graph
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={result.id}
              className="group p-6 bg-white/3 border border-white/15 rounded-xl hover:bg-white/5 hover:border-white/30 transition-all duration-300 hover:translate-x-2"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
                  <p className="text-white/60 leading-relaxed">{result.excerpt}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {result.source}
                  </span>
                  <span>Page {result.page}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/60"
                        style={{ width: `${result.relevance}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-white/60">{result.relevance}%</span>
                  </div>
                  <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-all duration-300">
                    View Context
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button className="w-full mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl text-sm font-medium transition-all duration-300">
            Load more results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsArea;