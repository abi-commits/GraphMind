import { useState, useEffect, useCallback } from 'react';
import { GraphData } from '@/types/graph';
import { sampleGraphData } from '@/data/sampleGraphData';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface UseKnowledgeGraphResult {
  graphData: GraphData | null;
  isLoading: boolean;
  error: string | null;
  refreshGraph: () => void;
  filterByType: (types: string[]) => void;
  searchNodes: (query: string) => void;
  setGraphDataFromQuery: (queryGraphData: any) => void;
}

export const useKnowledgeGraph = (): UseKnowledgeGraphResult => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<GraphData | null>(null);
  const { toast } = useToast();

  // Convert API graph data to our GraphData format
  const convertApiGraphData = (apiGraphData: any): GraphData | null => {
    if (!apiGraphData || !apiGraphData.nodes || !apiGraphData.edges) {
      return null;
    }

    const nodes = apiGraphData.nodes.map((node: any) => ({
      id: node.id,
      label: node.label,
      type: node.type,
      group: node.type.toLowerCase(),
      description: node.description,
      confidence: node.confidence,
      x: Math.random() * 800,
      y: Math.random() * 600,
      fx: null,
      fy: null
    }));

    const links = apiGraphData.edges.map((edge: any) => ({
      source: edge.source,
      target: edge.target,
      type: edge.type,
      description: edge.description,
      confidence: edge.confidence,
      strength: edge.confidence || 0.5
    }));

    return { nodes, links };
  };

  // Set graph data from query results
  const setGraphDataFromQuery = useCallback((queryGraphData: any) => {
    if (queryGraphData) {
      const convertedData = convertApiGraphData(queryGraphData);
      if (convertedData) {
        setGraphData(convertedData);
        setOriginalData(convertedData);
        toast({
          title: "Knowledge Graph Updated",
          description: `Graph updated with ${convertedData.nodes.length} nodes and ${convertedData.links.length} connections from your query.`,
        });
        return;
      }
    }
    
    // No fallback - show empty state if no query data
    setGraphData(null);
    setOriginalData(null);
  }, [toast]);

  // Fetch graph data from backend
  const fetchGraphData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get document stats first to see if there are any processed documents
      const stats = await apiClient.getDocumentStats();
      
      if (stats.success && stats.total_documents > 0) {
        // If documents exist, we could query for a general knowledge graph
        // For now, we'll use sample data as there's no general KG endpoint
        // No documents processed yet
        setGraphData(null);
        setOriginalData(null);
        
        toast({
          title: "ℹ️ No Knowledge Graph Data",
          description: "Process some documents and make queries to generate a knowledge graph.",
        });
      } else {
        // No documents in the system
        setGraphData(null);
        setOriginalData(null);
      }
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch knowledge graph data';
      setError(errorMessage);
      
      toast({
        title: "❌ Failed to Load Graph",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Clear graph data on error
      setGraphData(null);
      setOriginalData(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Filter graph by node types
  const filterByType = useCallback((types: string[]) => {
    if (!originalData) return;
    
    if (types.length === 0) {
      setGraphData(originalData);
      return;
    }
    
    const filteredNodes = originalData.nodes.filter(node => 
      types.includes(node.type)
    );
    
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    const filteredLinks = originalData.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });
    
    setGraphData({
      nodes: filteredNodes,
      links: filteredLinks
    });
    
    toast({
      title: "Graph Filtered",
      description: `Showing ${filteredNodes.length} nodes of type(s): ${types.join(', ')}`,
    });
  }, [originalData, toast]);

  // Search nodes by label
  const searchNodes = useCallback((query: string) => {
    if (!originalData) return;
    
    if (!query.trim()) {
      setGraphData(originalData);
      return;
    }
    
    const searchTerm = query.toLowerCase();
    const matchingNodes = originalData.nodes.filter(node =>
      node.label.toLowerCase().includes(searchTerm)
    );
    
    const nodeIds = new Set(matchingNodes.map(node => node.id));
    const relatedLinks = originalData.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return nodeIds.has(sourceId) || nodeIds.has(targetId);
    });
    
    // Include connected nodes
    const connectedNodeIds = new Set(nodeIds);
    relatedLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      connectedNodeIds.add(sourceId);
      connectedNodeIds.add(targetId);
    });
    
    const searchResults = originalData.nodes.filter(node =>
      connectedNodeIds.has(node.id)
    );
    
    setGraphData({
      nodes: searchResults,
      links: relatedLinks
    });
    
    toast({
      title: "Search Results",
      description: `Found ${matchingNodes.length} matching nodes, showing ${searchResults.length} total nodes with connections.`,
    });
  }, [originalData, toast]);

  // Refresh graph data
  const refreshGraph = useCallback(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Load data on mount
  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  return {
    graphData,
    isLoading,
    error,
    refreshGraph,
    filterByType,
    searchNodes,
    setGraphDataFromQuery,
  };
};