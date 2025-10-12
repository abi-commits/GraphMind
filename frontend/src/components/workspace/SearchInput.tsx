import React from 'react';
import { Search, Loader } from 'lucide-react';

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  onQuery: () => void;
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
  return (
    <div className="p-6 border-b border-white/10">
      <div 
        className={`relative transition-all duration-300 ${
          isDragging ? 'scale-105' : ''
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={`p-6 border-2 border-dashed rounded-2xl transition-all duration-300 ${
          isDragging 
            ? 'border-white/60 bg-white/10' 
            : 'border-white/20 bg-white/5'
        }`}>
          <div className="text-center mb-4">
            <div className="text-xl font-bold mb-2">Drop PDF or Ask Question</div>
            <div className="text-sm text-white/40">Upload documents to analyze or query your existing knowledge base</div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-xs text-white/40 font-mono">OR</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onQuery()}
              placeholder="Ask anything about your documents..."
              className="w-full bg-black/40 border border-white/20 rounded-xl pl-12 pr-12 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 focus:bg-black/60 transition-all duration-300"
              disabled={isQuerying}
            />
            <button 
              onClick={onQuery}
              disabled={isQuerying}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isQuerying ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInput;