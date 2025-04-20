/* eslint-disable no-unused-vars */
//----------------------------------------------------
// src/features/graph/KnowledgeGraphView.js
//----------------------------------------------------
import React, { useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph';
import useStore from '../store/useStore';

const KnowledgeGraphView = () => {
  const { graphData, selectNote } = useStore();
  const fgRef = useRef();

  // Custom node color based on type
  const getNodeColor = (node) => {
    if (node.type === 'note') return '#4f46e5'; // Indigo for notes
    if (node.type === 'entity') return '#f59e0b'; // Amber for entities
    if (node.type === 'tag') return '#10b981'; // Emerald for tags
    return '#6b7280'; // Gray default
  };

  // Node click handler
  const handleNodeClick = useCallback((node) => {
    if (node.type === 'note') {
      selectNote(node.id);
    }
    
    // Center view on clicked node
    const distance = 200;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y);
    fgRef.current.centerAt(node.x, node.y, 1000);
    fgRef.current.zoom(2, 1000);
  }, [selectNote]);

  // Link color based on relationship type
  const getLinkColor = (link) => {
    switch (link.type) {
      case 'manual':
        return '#4f46e5';
      case 'inferred_entity':
        return '#f59e0b';
      case 'inferred_semantic':
        return '#10b981';
      default:
        return '#9ca3af';
    }
  };

  return (
    <div className="w-full h-full">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={node => `${node.label || node.id}`}
        nodeColor={getNodeColor}
        linkColor={getLinkColor}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label || node.id;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();

          // Draw background for text
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
          );

          // Draw text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#1f2937';
          ctx.fillText(label, node.x, node.y);
        }}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        onEngineStop={() => fgRef.current.zoomToFit(400)}
      />
    </div>
  );
};

export default KnowledgeGraphView;