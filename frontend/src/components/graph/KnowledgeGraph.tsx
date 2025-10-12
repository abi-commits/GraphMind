import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { GraphData, GraphNode, GraphLink } from '@/types/graph';

interface KnowledgeGraphProps {
  data: GraphData;
  className?: string;
  onNodeSelect?: (node: GraphNode | null) => void;
}

// Enhanced node styles with type definitions
const NODE_STYLES = {
  document: { color: '#4ecdc4', size: 12, strokeWidth: 3 },
  concept: { color: '#ff6b6b', size: 10, strokeWidth: 2 },
  entity: { color: '#00ff88', size: 8, strokeWidth: 2 },
  topic: { color: '#ffd93d', size: 14, strokeWidth: 3 },
  keyword: { color: '#c44dff', size: 6, strokeWidth: 1.5 },
};

// Enhanced link styles for different relationship types
const LINK_STYLES = {
  contains: { color: '#4ecdc4', width: 3, opacity: 0.8, dashArray: 'none' },
  relates_to: { color: '#ff6b6b', width: 2, opacity: 0.6, dashArray: '5,5' },
  mentions: { color: '#00ff88', width: 1, opacity: 0.4, dashArray: '2,3' },
  categorized_as: { color: '#ffd93d', width: 2, opacity: 0.7, dashArray: 'none' },
  tagged_with: { color: '#c44dff', width: 1, opacity: 0.5, dashArray: '3,2' },
};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  data, 
  className = '', 
  onNodeSelect 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  // Enhanced state management
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // Resize observer for responsive design
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Enhanced node selection with callback
  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  // Zoom control functions
  const zoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
  }, []);

  const zoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.75);
  }, []);

  const fullView = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    
    const svg = d3.select(svgRef.current);
    
    // Reset to full view: center the graph and set zoom to 1.0 (100%)
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    svg.transition().duration(750).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(centerX - dimensions.width / 2, centerY - dimensions.height / 2).scale(1.0)
    );
  }, [dimensions]);



  // Main D3.js visualization effect
  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create background grid pattern
    const defs = svg.append('defs');
    
    // Grid pattern
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 20)
      .attr('height', 20)
      .attr('patternUnits', 'userSpaceOnUse');
    
    pattern.append('circle')
      .attr('cx', 10)
      .attr('cy', 10)
      .attr('r', 0.5)
      .attr('fill', 'rgba(255,255,255,0.1)');

    // Add grid background
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#grid)');

    // Create arrow markers for different link types
    Object.entries(LINK_STYLES).forEach(([linkType, style]) => {
      defs.append('marker')
        .attr('id', `arrowhead-${linkType}`)
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', style.color)
        .attr('opacity', style.opacity);
    });

    // Create main group for zoom/pan
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Create containers for different elements
    const linkGroup = mainGroup.append('g').attr('class', 'links');
    const nodeGroup = mainGroup.append('g').attr('class', 'nodes');
    const labelGroup = mainGroup.append('g').attr('class', 'labels');

    // Create simulation with enhanced forces
    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(data.links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(d => (NODE_STYLES[(d as GraphNode).type as keyof typeof NODE_STYLES]?.size || 10) + 5));

    simulationRef.current = simulation;

    // Create animated links with enhanced styling
    const links = linkGroup.selectAll<SVGLineElement, GraphLink>('.link')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', d => LINK_STYLES[d.type as keyof typeof LINK_STYLES]?.color || '#ffffff40')
      .attr('stroke-width', d => LINK_STYLES[d.type as keyof typeof LINK_STYLES]?.width || 2)
      .attr('stroke-opacity', d => LINK_STYLES[d.type as keyof typeof LINK_STYLES]?.opacity || 0.6)
      .attr('stroke-dasharray', d => LINK_STYLES[d.type as keyof typeof LINK_STYLES]?.dashArray || 'none')
      .attr('marker-end', d => `url(#arrowhead-${d.type})`);

    // Add animated particles for data flow
    const particles = linkGroup.selectAll<SVGCircleElement, GraphLink>('.particle')
      .data(data.links.filter(d => d.type === 'contains' || d.type === 'relates_to'))
      .enter()
      .append('circle')
      .attr('class', 'particle')
      .attr('r', 2)
      .attr('fill', '#ffffff')
      .attr('opacity', 0.8);

    // Animate particles along links
    function animateParticles() {
      particles
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attrTween('transform', function(d) {
          const link = d as GraphLink;
          const source = link.source as GraphNode;
          const target = link.target as GraphNode;
          return t => {
            const x = source.x! + (target.x! - source.x!) * t;
            const y = source.y! + (target.y! - source.y!) * t;
            return `translate(${x},${y})`;
          };
        })
        .on('end', animateParticles);
    }
    animateParticles();

    // Enhanced nodes with improved interactivity
    const nodes = nodeGroup.selectAll<SVGCircleElement, GraphNode>('.node')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => NODE_STYLES[d.type as keyof typeof NODE_STYLES]?.size || 10)
      .attr('fill', d => NODE_STYLES[d.type as keyof typeof NODE_STYLES]?.color || '#ffffff')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.3s ease');

    // Enhanced node labels
    const labels = labelGroup.selectAll<SVGTextElement, GraphNode>('.label')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (NODE_STYLES[d.type as keyof typeof NODE_STYLES]?.size || 10) + 15)
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text(d => d.label);

    // Enhanced drag behavior
    const drag = d3.drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodes.call(drag);

    // Enhanced hover and click interactions
    nodes
      .on('mouseenter', function(event, d) {
        // Highlight connected nodes and links
        const connectedNodeIds = new Set<string>();
        
        links
          .style('opacity', link => {
            const linkSource = typeof link.source === 'string' ? link.source : link.source.id;
            const linkTarget = typeof link.target === 'string' ? link.target : link.target.id;
            
            if (linkSource === d.id || linkTarget === d.id) {
              connectedNodeIds.add(linkSource);
              connectedNodeIds.add(linkTarget);
              return 1;
            }
            return 0.2;
          });

        nodes
          .style('opacity', node => connectedNodeIds.has(node.id) ? 1 : 0.3)
          .attr('stroke-width', node => node.id === d.id ? 4 : 2);

        labels
          .style('opacity', node => connectedNodeIds.has(node.id) ? 1 : 0.3);
      })
      .on('mouseleave', () => {
        // Reset all highlights
        links.style('opacity', d => LINK_STYLES[d.type as keyof typeof LINK_STYLES]?.opacity || 0.6);
        nodes.style('opacity', 1).attr('stroke-width', 2);
        labels.style('opacity', 1);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        handleNodeSelect(selectedNode?.id === d.id ? null : d);
        
        // Visual selection feedback
        nodes.attr('stroke-width', node => node.id === d.id ? 4 : 2);
      });

    // Zoom and pan behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
        setTransform(event.transform);
      });

    // Store zoom behavior in ref for button controls
    zoomRef.current = zoom;
    svg.call(zoom);

    // Click on empty space to deselect
    svg.on('click', () => {
      handleNodeSelect(null);
      nodes.attr('stroke-width', 2);
    });

    // Simulation tick function
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      nodes
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, handleNodeSelect]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main SVG */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-transparent"
      />

      {/* Graph Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={fullView}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200"
          title="Full View (100%)"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Mini-map */}
      <div className="absolute bottom-4 right-4 w-32 h-24 bg-black/60 border border-white/20 rounded-lg overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width * dimensions.width;
            const y = (e.clientY - rect.top) / rect.height * dimensions.height;
            
            if (svgRef.current && zoomRef.current) {
              const svg = d3.select(svgRef.current);
              svg.transition().duration(300).call(
                zoomRef.current.transform,
                d3.zoomIdentity.translate(
                  dimensions.width / 2 - x * transform.k,
                  dimensions.height / 2 - y * transform.k
                ).scale(transform.k)
              );
            }
          }}
        >
          {/* Mini-map nodes */}
          {data.nodes.map(node => (
            <circle
              key={node.id}
              cx={(node as any).x || dimensions.width / 2}
              cy={(node as any).y || dimensions.height / 2}
              r={1}
              fill={NODE_STYLES[node.type as keyof typeof NODE_STYLES]?.color || '#ffffff'}
              opacity={0.8}
            />
          ))}
          {/* Mini-map viewport indicator */}
          <rect
            x={-transform.x / transform.k}
            y={-transform.y / transform.k}
            width={dimensions.width / transform.k}
            height={dimensions.height / transform.k}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2 / transform.k}
            opacity={0.5}
          />
        </svg>
      </div>

      {/* Node info overlay */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-black/80 border border-white/20 rounded-lg p-4 max-w-64">
          <h3 className="font-semibold text-lg mb-2">{selectedNode.label}</h3>
          <div className="space-y-1 text-sm text-white/80">
            <div>Type: <span className="text-white">{selectedNode.type}</span></div>
            {selectedNode.description && (
              <div>Description: <span className="text-white">{selectedNode.description}</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;