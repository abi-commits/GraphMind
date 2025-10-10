export interface Document {
  id: string;
  name: string;
  size: number;
  processed: boolean;
  uploadedAt: string;
  chunksCount?: number;
}

export interface QueryRequest {
  query: string;
  top_k: number;
  include_summary: boolean;
  include_knowledge_graph: boolean;
  file_path?: string;
}

export interface QueryResponse {
  success: boolean;
  summary?: string;
  knowledge_graph?: KnowledgeGraph;
  entities?: Entity[];
  relationships?: Relationship[];
  visualization_data?: VisualizationData;
  relevant_chunks?: RelevantChunk[];
  processing_steps?: string[];
  processing_time?: number;
  error?: string;
}

export interface KnowledgeGraph {
  entities: Entity[];
  relationships: Relationship[];
  metrics: GraphMetrics;
  visualization_data: VisualizationData;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  description?: string;
  confidence: number;
}

export interface Relationship {
  source: string;
  target: string;
  type: string;
  description?: string;
  confidence: number;
}

export interface GraphMetrics {
  node_count: number;
  edge_count: number;
  density: number;
  connected_components: number;
  average_degree: number;
}

export interface VisualizationData {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  metrics: GraphMetrics;
}

export interface VisualizationNode {
  id: string;
  label: string;
  type: string;
  description?: string;
  confidence: number;
  size?: number;
}

export interface VisualizationEdge {
  source: string;
  target: string;
  type: string;
  description?: string;
  confidence: number;
  width?: number;
}

export interface RelevantChunk {
  content: string;
  document_name: string;
  chunk_index: number;
  similarity_score?: number;
  page_number?: number;
}

export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number;
}