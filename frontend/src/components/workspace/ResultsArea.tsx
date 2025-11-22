import React from 'react';
import { Search, FileText, Network, Sparkles, Brain, Eye, Copy } from 'lucide-react';
import { QueryResult } from '@/hooks/useQuery';

// Simple HTML-escape to avoid injection when using innerHTML
const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Lightweight converter: **bold** -> <strong>, preserve paragraph breaks and single newlines
const renderSummaryHtml = (text: string) => {
  if (!text) return '';
  const normalized = text.replace(/\r\n/g, '\n');
  // Escape first
  let html = escapeHtml(normalized);
  // Bold **text** -> <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Split paragraphs on empty lines and convert single newlines to <br/>
  const paragraphs = html
    .split(/\n\s*\n/) // double newline -> paragraph
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return paragraphs;
};

interface ResultsAreaProps {
  results: QueryResult[];
  summary?: string;
  isQuerying: boolean;
  documentsCount: number;
  onShowGraph: () => void;
  showGraph: boolean;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({
  results,
  summary,
  isQuerying,
  documentsCount,
  onShowGraph,
  showGraph
}) => {
  if (isQuerying) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Loading State */}
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-8">
              {/* Main spinner */}
              <div className="w-20 h-20 border-4 border-white/10 border-t-purple-400 rounded-full animate-spin"></div>
              
              {/* Inner elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-white/5 border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white/60 animate-pulse" />
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-1/2 -left-4 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>

            <div className="text-center max-w-lg">
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI Processing Your Query
              </h3>
              <p className="text-white/60 mb-6 leading-relaxed">
                Our intelligent system is analyzing your documents, extracting entities, 
                building relationships, and preparing insights just for you.
              </p>
              
              {/* Processing steps */}
              <div className="flex items-center justify-center gap-8 text-xs">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Search className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                  <span className="text-white/50">Searching</span>
                </div>
                <div className="w-8 h-px bg-white/20 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-blue-400 animate-pulse" />
                  </div>
                  <span className="text-white/50">Analyzing</span>
                </div>
                <div className="w-8 h-px bg-white/20 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Network className="w-4 h-4 text-green-400 animate-pulse" />
                  </div>
                  <span className="text-white/50">Connecting</span>
                </div>
              </div>
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
        {/* AI Summary Section */}
        {summary && (
          <div className="mb-8 p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/20 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">AI Summary</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(summary)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Copy summary"
                >
                  <Copy className="w-4 h-4 text-white/60" />
                </button>

                <button
                  onClick={onShowGraph}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
                  title={showGraph ? 'Hide Knowledge Graph' : 'View Knowledge Graph'}
                >
                  <Network className="w-4 h-4" />
                  <span className="hidden sm:inline">{showGraph ? 'Hide' : 'View'}</span>
                </button>
              </div>
            </div>

            {/* Render a lightly-processed markdown-like summary for readability */}
            <div className="prose prose-invert text-white/80 leading-relaxed max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: renderSummaryHtml(summary) }}
              />
            </div>
          </div>
        )}

        {/* Only show AI summary per request. Results list hidden. */}
        {!summary && (
          <div className="p-6 bg-white/3 border border-white/10 rounded-xl text-center">
            <p className="text-white/60">AI summary is not available for this query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsArea;