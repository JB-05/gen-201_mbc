'use client';

import { useEffect, useRef, useMemo } from 'react';

interface Node {
  x: number;
  y: number;
  connections: number[];
}

export default function NeuralBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Memoize the neural network structure to avoid recalculation
  const neuralData = useMemo(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
    
    const isMobile = width < 768;
    const nodeCount = isMobile ? 8 : 12; // Reduced node count for better performance
    
    // Create nodes with fixed positions for consistency
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => {
      const gridSize = Math.ceil(Math.sqrt(nodeCount));
      const cellWidth = width / gridSize;
      const cellHeight = height / gridSize;
      
      const gridX = i % gridSize;
      const gridY = Math.floor(i / gridSize);
      
      // Use deterministic positioning with slight variation
      const x = (gridX * cellWidth) + (cellWidth * 0.3) + ((i * 0.1) % (cellWidth * 0.4));
      const y = (gridY * cellHeight) + (cellHeight * 0.3) + ((i * 0.15) % (cellHeight * 0.4));
      
      return { x, y, connections: [] };
    });
    
    // Create connections (simplified)
    nodes.forEach((node, i) => {
      const distances = nodes
        .map((otherNode, index) => ({
          index,
          distance: Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + 
            Math.pow(node.y - otherNode.y, 2)
          )
        }))
        .filter(d => d.index !== i)
        .sort((a, b) => a.distance - b.distance);
      
      // Reduced connections for better performance
      const connectionCount = Math.min(2, distances.length);
      node.connections = distances
        .slice(0, connectionCount)
        .map(d => d.index);
    });
    
    return { nodes, width, height, isMobile };
  }, []);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const { nodes, width, height, isMobile } = neuralData;
    
    // Create SVG elements
    svg.innerHTML = '';
    
    // Add paths (connections) with optimized styling
    nodes.forEach((node) => {
      node.connections.forEach(connectionIndex => {
        const targetNode = nodes[connectionIndex];
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        path.setAttribute('d', `M ${node.x} ${node.y} L ${targetNode.x} ${targetNode.y}`);
        path.setAttribute('stroke', '#7303c0');
        path.setAttribute('stroke-width', isMobile ? '1.5' : '1');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.6');
        path.setAttribute('style', `
          stroke-dasharray: 200;
          animation: pathFlow 6s linear infinite;
          will-change: stroke-dashoffset;
        `);
        
        svg.appendChild(path);
      });
    });
    
    // Add nodes with optimized styling
    nodes.forEach(node => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      
      circle.setAttribute('cx', node.x.toString());
      circle.setAttribute('cy', node.y.toString());
      circle.setAttribute('r', isMobile ? '3' : '2.5');
      circle.setAttribute('fill', '#928dab');
      circle.setAttribute('opacity', '0.8');
      circle.setAttribute('style', `
        animation: nodeGlow 4s ease-in-out infinite;
        will-change: transform, opacity;
      `);
      
      svg.appendChild(circle);
    });
  }, [neuralData]);
  
  return (
    <div className="absolute inset-0 w-full h-full will-change-transform">
      <svg
        ref={svgRef}
        className="w-full h-full opacity-25 md:opacity-30"
        style={{ 
          transform: 'translate3d(0, 0, 0) scale(1.05)',
          transformOrigin: 'center',
          willChange: 'transform'
        }}
      />
    </div>
  );
}
