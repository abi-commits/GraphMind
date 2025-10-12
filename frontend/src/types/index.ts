// Shared type definitions for the application

export interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface GraphData {
  nodes: Node[];
  edges: Array<{ source: number; target: number }>;
}

// Add more shared types as needed
