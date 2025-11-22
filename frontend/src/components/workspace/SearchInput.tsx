import React, { useState, useRef } from 'react';
import { Search, Loader, X } from 'lucide-react';

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  onQuery: () => void | Promise<void>;
  isQuerying: boolean;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  query,
  setQuery,
  onQuery,
  isQuerying,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isQuerying) {
        void onQuery();
      }
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };



  return (
    <div className="p-6 border-b border-white/10">
      <div
        className={`relative transition-all duration-300 ${isDragging ? 'scale-[1.02]' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={`rounded-2xl transition-all duration-300 p-4 bg-gradient-to-br from-black/60 via-black/55 to-black/60 border ${
          isDragging ? 'border-purple-600/40 shadow-xl' : isFocused ? 'border-white/20' : 'border-white/10'
        }`}>
          {/* shadcn-inspired header with gradient accent */}
          <div className="mb-3">
            <label className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Ask GraphMind</label>
            <p className="text-xs text-white/40 mt-1">Search uploaded documents for answers, summaries, and relationships.</p>
          </div>

          {/* shadcn-style input group */}
          <div className="flex items-center gap-3">
              {/* Left icon */}
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-br from-purple-600 to-blue-500 shadow-sm">
                <Search className="w-4 h-4 text-white/90" />
              </div>
            

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g. Summarize the uploaded resume or find key entities"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 py-2 px-3 rounded-md border border-transparent focus:outline-none focus:ring-1 focus:ring-white/10"
              disabled={isQuerying}
              aria-label="Search input"
            />

            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="p-2 rounded-md text-white/70 hover:text-white/100"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => { if (!isQuerying && query.trim()) void onQuery(); }}
              disabled={isQuerying || !query.trim()}
              className="inline-flex items-center rounded-md px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:brightness-105 disabled:opacity-50 shadow-md"
              aria-label="Submit search"
            >
              {isQuerying ? <Loader className="w-4 h-4 animate-spin" /> : <span className="text-sm font-medium">Search</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInput;