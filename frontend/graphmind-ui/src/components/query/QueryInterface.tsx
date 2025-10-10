import React, { useState } from 'react';
import { Search, Settings, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useQuery } from '@/hooks/useQuery';
import { QueryRequest } from '@/types';

export const QueryInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [topK, setTopK] = useState(5);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeKG, setIncludeKG] = useState(true);
  
  const { executeQuery, status, data, isLoading } = useQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const request: QueryRequest = {
      query: query.trim(),
      top_k: topK,
      include_summary: includeSummary,
      include_knowledge_graph: includeKG,
    };

    await executeQuery(request);
  };

  const handleExport = () => {
    if (!data) return;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graphmind-query-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Ask GraphMind</h2>
          <p className="text-sm text-gray-600">
            Query your documents and explore relationships through the knowledge graph
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your documents..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
              <div className="absolute right-3 top-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                <Settings className="h-4 w-4 mr-1" />
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Top K Results
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={topK}
                      onChange={(e) => setTopK(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-summary"
                      checked={includeSummary}
                      onChange={(e) => setIncludeSummary(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include-summary" className="ml-2 text-sm text-gray-700">
                      Include Summary
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-kg"
                      checked={includeKG}
                      onChange={(e) => setIncludeKG(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include-kg" className="ml-2 text-sm text-gray-700">
                      Include Knowledge Graph
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                type="submit"
                loading={isLoading}
                disabled={!query.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : 'Search'}
              </Button>
              
              {data && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExport}
                  icon={Download}
                >
                  Export
                </Button>
              )}
            </div>
          </form>

          {/* Status Message */}
          {status.message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                status.status === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : status.status === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {status.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Summary */}
          {data.summary && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Summary</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{data.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Relevant Chunks */}
          {data.relevant_chunks && data.relevant_chunks.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  Relevant Content ({data.relevant_chunks.length} chunks)
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.relevant_chunks.map((chunk, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {chunk.document_name}
                        {chunk.page_number && ` • Page ${chunk.page_number}`}
                      </span>
                      {chunk.similarity_score && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {Math.round(chunk.similarity_score * 100)}% match
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};