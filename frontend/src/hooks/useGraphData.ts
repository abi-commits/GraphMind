import { useState, useCallback } from 'react';
import { GraphData, GraphNode, GraphLink, GraphFilters, GraphInteraction, NodeType, LinkType } from '@/types/graph';

// Hook for managing graph data and state
export const useGraphData = (initialData?: GraphData) => {
  const [graphData, setGraphData] = useState<GraphData>(initialData || { nodes: [], links: [] });
  const [filters, setFilters] = useState<GraphFilters>({
    nodeTypes: new Set(['entity', 'concept', 'document', 'topic', 'keyword']),
    linkTypes: new Set(['relates_to', 'contains', 'mentions', 'similar_to', 'derives_from', 'cites']),
    importanceThreshold: 0,
    searchQuery: '',
    showLabels: true,
    clustering: false
  });
  const [interaction, setInteraction] = useState<GraphInteraction>({
    selectedNodes: new Set(),
    hoveredNode: null,
    highlightedPath: [],
    zoomLevel: 1,
    isPanning: false,
    isDragging: false
  });

  // Filter nodes and links based on current filters
  const filteredData = useCallback((): GraphData => {
    const filteredNodes = graphData.nodes.filter(node => {
      // Filter by node type
      if (!filters.nodeTypes.has(node.type)) return false;
      
      // Filter by importance threshold
      if (node.importance < filters.importanceThreshold) return false;
      
      // Filter by search query
      if (filters.searchQuery && !node.label.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link => {
      // Only include links where both nodes are visible
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      if (!filteredNodeIds.has(sourceId) || !filteredNodeIds.has(targetId)) return false;
      
      // Filter by link type
      if (!filters.linkTypes.has(link.type)) return false;
      
      return true;
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, filters]);

  // Update graph data
  const updateGraphData = useCallback((newData: GraphData) => {
    setGraphData(newData);
  }, []);

  // Add nodes to graph
  const addNodes = useCallback((nodes: GraphNode[]) => {
    setGraphData(prev => ({
      ...prev,
      nodes: [...prev.nodes, ...nodes]
    }));
  }, []);

  // Add links to graph
  const addLinks = useCallback((links: GraphLink[]) => {
    setGraphData(prev => ({
      ...prev,
      links: [...prev.links, ...links]
    }));
  }, []);

  // Remove nodes and associated links
  const removeNodes = useCallback((nodeIds: string[]) => {
    const nodeIdSet = new Set(nodeIds);
    setGraphData(prev => ({
      nodes: prev.nodes.filter(node => !nodeIdSet.has(node.id)),
      links: prev.links.filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        return !nodeIdSet.has(sourceId) && !nodeIdSet.has(targetId);
      })
    }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<GraphFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update interaction state
  const updateInteraction = useCallback((newInteraction: Partial<GraphInteraction>) => {
    setInteraction(prev => ({ ...prev, ...newInteraction }));
  }, []);

  // Select/deselect nodes
  const toggleNodeSelection = useCallback((nodeId: string) => {
    setInteraction(prev => {
      const newSelected = new Set(prev.selectedNodes);
      if (newSelected.has(nodeId)) {
        newSelected.delete(nodeId);
      } else {
        newSelected.add(nodeId);
      }
      return { ...prev, selectedNodes: newSelected };
    });
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setInteraction(prev => ({ 
      ...prev, 
      selectedNodes: new Set(),
      highlightedPath: []
    }));
  }, []);

  // Find shortest path between two nodes (simple BFS)
  const findPath = useCallback((startId: string, endId: string): string[] => {
    if (startId === endId) return [startId];
    
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: startId, path: [startId] }];
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      // Find connected nodes
      const connectedNodes = graphData.links
        .filter(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          return sourceId === nodeId || targetId === nodeId;
        })
        .map(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          return sourceId === nodeId ? targetId : sourceId;
        });
      
      for (const connectedId of connectedNodes) {
        if (connectedId === endId) {
          return [...path, connectedId];
        }
        
        if (!visited.has(connectedId)) {
          queue.push({ nodeId: connectedId, path: [...path, connectedId] });
        }
      }
    }
    
    return []; // No path found
  }, [graphData]);

  return {
    graphData,
    filteredData: filteredData(),
    filters,
    interaction,
    updateGraphData,
    addNodes,
    addLinks,
    removeNodes,
    updateFilters,
    updateInteraction,
    toggleNodeSelection,
    clearSelection,
    findPath
  };
};