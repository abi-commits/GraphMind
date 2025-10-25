import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader, FileText, Sparkles, X, Network } from 'lucide-react';

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  onQuery: () => void;
  isQuerying: boolean;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  hasDocuments?: boolean;
  recentQueries?: string[];
}

const SearchInput: React.FC<SearchInputProps> = ({
  query,
  setQuery,
  onQuery,
  isQuerying,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  hasDocuments = false,
  recentQueries = []
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQueries = [
    "Summarize the key points from all documents",
    "What are the main entities and their relationships?",
    "Show me the knowledge graph for this content",
    "Extract all important concepts and connections",
    "What are the key topics and how do they relate?",
    "Generate a visual map of the information",
    "Find all people, organizations, and places mentioned",
    "What are the main themes and relationships?"
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isQuerying) {
        onQuery();
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-6 border-b border-white/10">
      <div 
        className={`relative transition-all duration-300 ${
          isDragging ? 'scale-[1.02]' : ''
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={`p-6 border-2 border-dashed rounded-2xl transition-all duration-300 ${
          isDragging 
            ? 'border-white/60 bg-white/10 shadow-2xl shadow-white/10' 
            : isFocused
            ? 'border-white/40 bg-white/[0.07]'
            : 'border-white/20 bg-white/5'
        }`}>
          {/* Header Section */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-xl font-bold mb-2">
              {isDragging ? (
                <>
                  <FileText className="w-5 h-5 animate-bounce" />
                  <span>Drop your PDF here</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Ask GraphMind</span>
                </>
              )}
            </div>
            <div className="text-sm text-white/40">
              {hasDocuments 
                ? 'Query your knowledge base or upload more documents'
                : 'Upload documents to analyze or start asking questions'
              }
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span className="text-xs text-white/40 font-mono px-2">SEARCH</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything about your documents..."
              className="w-full bg-black/40 border border-white/20 rounded-xl pl-12 pr-24 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 focus:bg-black/60 focus:ring-2 focus:ring-white/10 transition-all duration-300"
              disabled={isQuerying}
              aria-label="Search input"
            />
            
            {/* Clear Button */}
            {query && !isQuerying && (
              <button
                onClick={clearQuery}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white/80 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Button */}
            <button 
              onClick={onQuery}
              disabled={isQuerying || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg disabled:shadow-none"
              aria-label="Submit search"
            >
              {isQuerying ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && (query.length === 0 || isFocused) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-20">
                {/* Recent Queries */}
                {recentQueries.length > 0 && (
                  <div className="p-3 border-b border-white/10">
                    <div className="text-xs text-white/40 font-semibold mb-2 uppercase tracking-wide">Recent</div>
                    {recentQueries.slice(0, 3).map((recent, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(recent)}
                        className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Search className="w-3.5 h-3.5 text-white/40" />
                        <span className="truncate">{recent}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Query Templates */}
                {hasDocuments && (
                  <>
                    <div className="p-3 border-b border-white/10">
                      <div className="text-xs text-white/40 font-semibold mb-2 uppercase tracking-wide">Quick Actions</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSuggestionClick("Generate a knowledge graph showing all entities and relationships")}
                          className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/20 rounded-lg text-xs font-medium text-purple-200 transition-all duration-200 flex items-center gap-1.5"
                        >
                          <Network className="w-3 h-3" />
                          Knowledge Graph
                        </button>
                        <button
                          onClick={() => handleSuggestionClick("Summarize all key points and main topics")}
                          className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/20 rounded-lg text-xs font-medium text-blue-200 transition-all duration-200 flex items-center gap-1.5"
                        >
                          <FileText className="w-3 h-3" />
                          Summarize
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="text-xs text-white/40 font-semibold mb-2 uppercase tracking-wide">Suggested Queries</div>
                      {suggestedQueries.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center gap-2 group"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-white/40 group-hover:text-white/60 transition-colors" />
                          <span className="truncate">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Empty State */}
                {!hasDocuments && recentQueries.length === 0 && (
                  <div className="p-6 text-center">
                    <FileText className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-white/40">Upload documents to start querying</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Query Status */}
          {isQuerying && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-white/60">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Processing your query...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInput;