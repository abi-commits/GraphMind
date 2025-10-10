import React, { useEffect, useRef } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import { VisualizationData } from '@/types';

interface KnowledgeGraphVisualizationProps {
  data: VisualizationData;
  height?: string;
}

export const KnowledgeGraphVisualization: React.FC<KnowledgeGraphVisualizationProps> = ({
  data,
  height = '600px'
}) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!networkRef.current || !data) return;

    // Create nodes
    const nodes = new DataSet(
      data.nodes.map(node => ({
        id: node.id,
        label: node.label,
        title: `${node.type}\n${node.description || ''}\nConfidence: ${(node.confidence * 100).toFixed(1)}%`,
        group: node.type,
        value: node.confidence * 10,
        font: { size: 16 },
        borderWidth: 2,
      }))
    );

    // Create edges
    const edges = new DataSet(
      data.edges.map(edge => ({
        id: `${edge.source}-${edge.target}-${edge.type}`,
        from: edge.source,
        to: edge.target,
        label: edge.type.replace(/_/g, ' '),
        title: `${edge.description || ''}\nConfidence: ${(edge.confidence * 100).toFixed(1)}%`,
        width: Math.max(1, edge.confidence * 3),
        arrows: 'to',
        smooth: { enabled: true, type: 'continuous', roundness: 0.5 },
      }))
    );

    // Network options
    const options = {
      layout: {
        improvedLayout: true,
        hierarchical: {
          enabled: false,
        }
      },
      physics: {
        enabled: true,
        stabilization: { iterations: 100 },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
      },
      groups: {
        PERSON: { color: { background: '#3B82F6', border: '#1D4ED8' }, font: { color: 'white' } },
        ORGANIZATION: { color: { background: '#10B981', border: '#047857' }, font: { color: 'white' } },
        LOCATION: { color: { background: '#F59E0B', border: '#D97706' }, font: { color: 'white' } },
        CONCEPT: { color: { background: '#8B5CF6', border: '#7C3AED' }, font: { color: 'white' } },
        EVENT: { color: { background: '#EF4444', border: '#DC2626' }, font: { color: 'white' } },
        TECHNOLOGY: { color: { background: '#06B6D4', border: '#0891B2' }, font: { color: 'white' } },
      }
    };

    // Create network
    networkInstanceRef.current = new Network(
      networkRef.current,
      { nodes, edges },
      options
    );

    // Cleanup
    return () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
      }
    };
  }, [data]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No graph data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Knowledge Graph</h3>
        <div className="text-sm text-gray-600">
          {data.metrics.node_count} nodes • {data.metrics.edge_count} relationships
        </div>
      </div>
      
      <div
        ref={networkRef}
        style={{ height }}
        className="border border-gray-200 rounded-lg"
      />
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        {Array.from(new Set(data.nodes.map(n => n.type))).map(type => (
          <div key={type} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: getColorForType(type),
              }}
            />
            <span className="text-gray-600">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get colors for entity types
function getColorForType(type: string): string {
  const colorMap: { [key: string]: string } = {
    PERSON: '#3B82F6',
    ORGANIZATION: '#10B981',
    LOCATION: '#F59E0B',
    CONCEPT: '#8B5CF6',
    EVENT: '#EF4444',
    TECHNOLOGY: '#06B6D4',
  };
  return colorMap[type] || '#6B7280';
}