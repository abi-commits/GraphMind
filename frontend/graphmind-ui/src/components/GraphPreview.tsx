"use client";
import { useEffect, useRef } from "react";

// Simple animated graph preview using SVG and JS for subtle node/edge movement
export default function GraphPreview() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Animate nodes in a subtle floating pattern
    const svg = svgRef.current;
    if (!svg) return;
    const nodes = svg.querySelectorAll(".graph-node");
    const edges = svg.querySelectorAll(".graph-edge");
    let frame = 0;
    let raf: number;
    function animate() {
      frame++;
      nodes.forEach((node, i) => {
        const angle = frame / 60 + i * 1.5;
        const r = 6 + Math.sin(angle) * 2;
        const cx = 32 + Math.cos(angle) * 18;
        const cy = 32 + Math.sin(angle) * 18;
        (node as SVGCircleElement).setAttribute("cx", cx.toString());
        (node as SVGCircleElement).setAttribute("cy", cy.toString());
      });
      // Animate edges to follow nodes
      edges.forEach((edge, i) => {
        const n1 = nodes[i % nodes.length] as SVGCircleElement;
        const n2 = nodes[(i + 1) % nodes.length] as SVGCircleElement;
        (edge as SVGLineElement).setAttribute("x1", n1.getAttribute("cx")!);
        (edge as SVGLineElement).setAttribute("y1", n1.getAttribute("cy")!);
        (edge as SVGLineElement).setAttribute("x2", n2.getAttribute("cx")!);
        (edge as SVGLineElement).setAttribute("y2", n2.getAttribute("cy")!);
      });
      raf = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-64">
      <svg
        ref={svgRef}
        width={128}
        height={128}
        viewBox="0 0 64 64"
        className="drop-shadow-glow"
      >
        {/* Edges */}
        <line className="graph-edge" stroke="#38bdf8" strokeWidth="2" opacity="0.5" />
        <line className="graph-edge" stroke="#a5b4fc" strokeWidth="2" opacity="0.5" />
        <line className="graph-edge" stroke="#f472b6" strokeWidth="2" opacity="0.5" />
        <line className="graph-edge" stroke="#fbbf24" strokeWidth="2" opacity="0.5" />
        {/* Nodes */}
        <circle className="graph-node" r="6" fill="#38bdf8" />
        <circle className="graph-node" r="6" fill="#a5b4fc" />
        <circle className="graph-node" r="6" fill="#f472b6" />
        <circle className="graph-node" r="6" fill="#fbbf24" />
      </svg>
    </div>
  );
}
