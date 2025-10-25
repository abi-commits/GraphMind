import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient, QueryRequest, QueryResponse } from '@/lib/api';

export interface QueryResult {
  id: number;
  title: string;
  excerpt: string;
  source: string;
  page: number;
  relevance: number;
}

export interface KnowledgeGraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    description: string;
    confidence: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
    description: string;
    confidence: number;
  }>;
}

export const useQuery = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraphData | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const { toast } = useToast();

  const handleQuery = async (documentsCount: number) => {
    if (!query.trim()) {
      toast({
        title: "⚠️ Empty Query",
        description: "Please enter a question to search your documents.",
        variant: "destructive"
      });
      return;
    }

    if (documentsCount === 0) {
      toast({
        title: "📄 No Documents",
        description: "Upload some documents first to start querying!",
        variant: "destructive"
      });
      return;
    }

    setIsQuerying(true);
    toast({
      title: "🔍 Searching...",
      description: "Analyzing your documents for relevant information.",
    });

    try {
      const queryRequest: QueryRequest = {
        query: query.trim(),
        top_k: 5,
        include_summary: true,
        include_knowledge_graph: true
      };

      const response: QueryResponse = await apiClient.queryDocuments(queryRequest);

      if (response.success) {
        // Convert API response to QueryResult format
        const queryResults: QueryResult[] = response.relevant_chunks?.map((chunk, index) => ({
          id: index + 1,
          title: `Result ${index + 1}`,
          excerpt: chunk.content.substring(0, 200) + '...',
          source: chunk.metadata?.file_name || 'Unknown Source',
          page: chunk.metadata?.page || 1,
          relevance: Math.floor(Math.random() * 20) + 80 // Mock relevance for now
        })) || [];

        setResults(queryResults);
        setSummary(response.summary || '');
        
        // Set knowledge graph data
        if (response.visualization_data) {
          setKnowledgeGraph(response.visualization_data);
        }

        toast({
          title: "✨ Results Found",
          description: `Found ${queryResults.length} relevant results for your query.`,
        });
      } else {
        throw new Error(response.error || 'Query failed');
      }
    } catch (error) {
      console.error('Query error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to process your query';
      
      toast({
        title: "❌ Query Failed",
        description: errorMessage,
        variant: "destructive"
      });

      // Clear results and show error state
      setResults([]);
      setSummary('');
      setKnowledgeGraph(null);
    } finally {
      setIsQuerying(false);
    }
  };

  return {
    query,
    setQuery,
    results,
    summary,
    knowledgeGraph,
    isQuerying,
    handleQuery
  };
};