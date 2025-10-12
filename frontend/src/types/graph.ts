import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

// Node types in the knowledge graph
export type NodeType = 'entity' | 'concept' | 'document' | 'topic' | 'keyword';

// Relationship types between nodes
export type LinkType = 'relates_to' | 'contains' | 'mentions' | 'similar_to' | 'derives_from' | 'cites';

// Graph node interface extending D3's simulation node
export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: NodeType;
  size: number;
  color: string;
  description?: string;
  importance: number; // 0-1 scale for filtering
  source?: string; // source document/file
  metadata?: Record<string, any>;
  
  // D3 simulation properties (optional, will be set by D3)
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null; // fixed x position
  fy?: number | null; // fixed y position
}

// Graph link interface extending D3's simulation link
export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: LinkType;
  weight: number; // strength of relationship (0-1)
  label?: string;
  color?: string;
  description?: string;
  bidirectional?: boolean;
}

// Complete graph data structure
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Graph layout configurations
export interface GraphLayout {
  type: 'force' | 'hierarchical' | 'circular' | 'grid';
  strength: number;
  distance: number;
  collide: number;
}

// Graph styling configuration
export interface GraphStyle {
  nodeStyles: Record<NodeType, {
    color: string;
    size: number;
    shape: 'circle' | 'square' | 'hexagon' | 'diamond';
    stroke: string;
    strokeWidth: number;
  }>;
  linkStyles: Record<LinkType, {
    color: string;
    width: number;
    dashArray?: string;
    opacity: number;
  }>;
}

// Graph interaction state
export interface GraphInteraction {
  selectedNodes: Set<string>;
  hoveredNode: string | null;
  highlightedPath: string[];
  zoomLevel: number;
  isPanning: boolean;
  isDragging: boolean;
}

// Graph filter options
export interface GraphFilters {
  nodeTypes: Set<NodeType>;
  linkTypes: Set<LinkType>;
  importanceThreshold: number;
  searchQuery: string;
  showLabels: boolean;
  clustering: boolean;
}

// Default styles
export const DEFAULT_NODE_STYLES: Record<NodeType, GraphStyle['nodeStyles'][NodeType]> = {
  entity: {
    color: '#00ff88',
    size: 20,
    shape: 'circle',
    stroke: '#ffffff',
    strokeWidth: 2
  },
  concept: {
    color: '#ff6b6b',
    size: 15,
    shape: 'hexagon',
    stroke: '#ffffff',
    strokeWidth: 1.5
  },
  document: {
    color: '#4ecdc4',
    size: 25,
    shape: 'square',
    stroke: '#ffffff',
    strokeWidth: 2
  },
  topic: {
    color: '#ffe66d',
    size: 18,
    shape: 'diamond',
    stroke: '#ffffff',
    strokeWidth: 1.5
  },
  keyword: {
    color: '#a8e6cf',
    size: 12,
    shape: 'circle',
    stroke: '#ffffff',
    strokeWidth: 1
  }
};

export const DEFAULT_LINK_STYLES: Record<LinkType, GraphStyle['linkStyles'][LinkType]> = {
  relates_to: {
    color: '#ffffff40',
    width: 2,
    opacity: 0.6
  },
  contains: {
    color: '#ffffff60',
    width: 3,
    opacity: 0.8
  },
  mentions: {
    color: '#ffffff30',
    width: 1,
    dashArray: '5,5',
    opacity: 0.4
  },
  similar_to: {
    color: '#ff6b6b40',
    width: 2,
    dashArray: '3,3',
    opacity: 0.5
  },
  derives_from: {
    color: '#4ecdc440',
    width: 2.5,
    opacity: 0.7
  },
  cites: {
    color: '#ffe66d40',
    width: 1.5,
    dashArray: '2,2',
    opacity: 0.5
  }
};