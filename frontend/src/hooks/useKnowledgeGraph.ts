import { useState, useEffect, useCallback } from 'react';
import { GraphData } from '@/types/graph';
import { sampleGraphData } from '@/data/sampleGraphData';
import { useToast } from '@/hooks/use-toast';

interface UseKnowledgeGraphResult {
  graphData: GraphData | null;
  isLoading: boolean;
  error: string | null;
  refreshGraph: () => void;
  filterByType: (types: string[]) => void;
  searchNodes: (query: string) => void;
}

export const useKnowledgeGraph = (): UseKnowledgeGraphResult => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<GraphData | null>(null);
  const { toast } = useToast();

  // Simulate fetching graph data from backend
  const fetchGraphData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In real app, this would be an API call
      // const response = await fetch('/api/knowledge-graph');
      // const data = await response.json();
      
      setGraphData(sampleGraphData);
      setOriginalData(sampleGraphData);
      
      toast({
        title: "Knowledge Graph Loaded",
        description: `Successfully loaded ${sampleGraphData.nodes.length} nodes and ${sampleGraphData.links.length} connections.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load knowledge graph';
      setError(errorMessage);
      
      toast({
        title: "Failed to Load Graph",
        description: errorMessage,
        variant: "destructive",
      });
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
  };
};