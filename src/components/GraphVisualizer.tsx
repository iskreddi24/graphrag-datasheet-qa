import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  GraphEntity,
  GraphRelationship,
  CommunityDefinition,
  EntityType
} from '../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Search,
  Layers,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface GraphVisualizerProps {
  nodes: GraphEntity[];
  links: GraphRelationship[];
  communities: CommunityDefinition[];
  selectedEntity: GraphEntity | null;
  onSelectEntity: (entity: GraphEntity | null) => void;
}

interface SimulationNode extends d3.SimulationNodeDatum, GraphEntity {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode>, GraphRelationship {
  source: any;
  target: any;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  nodes,
  links,
  communities,
  selectedEntity,
  onSelectEntity
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [communityFilter, setCommunityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<GraphEntity | null>(null);

  // Zoom reference for manual zoom buttons
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Colors for Entity Types
  const getNodeColor = (type: EntityType): string => {
    switch (type) {
      case 'COMPONENT':
        return '#10b981'; // Emerald
      case 'MANUFACTURER':
        return '#f59e0b'; // Amber
      case 'PROTOCOL':
        return '#3b82f6'; // Blue
      case 'CORE_ARCHITECTURE':
        return '#a855f7'; // Purple
      default:
        return '#94a3b8';
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    let filteredNodes = nodes;

    if (typeFilter !== 'ALL') {
      filteredNodes = filteredNodes.filter(n => n.type === typeFilter);
    }

    if (communityFilter !== 'ALL') {
      const commId = parseInt(communityFilter, 10);
      filteredNodes = filteredNodes.filter(n => n.community === commId);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(
        n => n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
      );
    }

    const validNodeNames = new Set(filteredNodes.map(n => n.name));
    const filteredLinks = links.filter(
      l => validNodeNames.has(l.source as string) && validNodeNames.has(l.target as string)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [nodes, links, typeFilter, communityFilter, searchTerm]);

  // Render D3 Force-Directed Simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 650;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Root container for zoom/pan
    const g = svg.append('g').attr('class', 'graph-container');

    // Setup D3 Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4.0])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Arrowhead marker definitions for directed edges
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 18)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#475569');

    // Clone data for simulation
    const simNodes: SimulationNode[] = filteredData.nodes.map(d => ({ ...d }));
    const simLinks: SimulationLink[] = filteredData.links.map(d => ({ ...d }));

    // Force Simulation Setup
    const simulation = d3.forceSimulation<SimulationNode>(simNodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(simLinks).id(d => d.name).distance(75))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => ((d as SimulationNode).degree * 1.5) + 14));

    // Links Rendering
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', d => d.type === 'COMPATIBLE_WITH' ? '#10b981' : '#334155')
      .attr('stroke-width', d => d.type === 'COMPATIBLE_WITH' ? 2 : 1)
      .attr('stroke-dasharray', d => d.type === 'POWERED_BY_CORE' ? '3 3' : 'none')
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)');

    // Nodes Group
    const nodeGroup = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, SimulationNode>()
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
          })
      );

    // Node Circles
    nodeGroup.append('circle')
      .attr('r', d => Math.max(7, Math.min(22, 6 + (d.degree || 1) * 1.2)))
      .attr('fill', d => getNodeColor(d.type))
      .attr('stroke', d => selectedEntity?.id === d.id ? '#ffffff' : '#0f172a')
      .attr('stroke-width', d => selectedEntity?.id === d.id ? 3 : 1.5)
      .attr('fill-opacity', 0.9)
      .transition()
      .duration(400);

    // Node Labels
    nodeGroup.append('text')
      .text(d => d.name)
      .attr('x', d => Math.max(9, Math.min(24, 8 + (d.degree || 1) * 1.2)))
      .attr('y', 4)
      .attr('font-size', d => d.type === 'COMPONENT' ? '11px' : '9px')
      .attr('font-weight', d => d.type === 'COMPONENT' ? '600' : '400')
      .attr('fill', '#e2e8f0')
      .attr('font-family', 'monospace')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8)');

    // Interactions
    nodeGroup
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectEntity(d);
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
        // Highlight immediate 1-hop connections
        const connectedNames = new Set<string>();
        connectedNames.add(d.name);
        simLinks.forEach(l => {
          const sName = typeof l.source === 'object' ? l.source.name : l.source;
          const tName = typeof l.target === 'object' ? l.target.name : l.target;
          if (sName === d.name) connectedNames.add(tName);
          if (tName === d.name) connectedNames.add(sName);
        });

        nodeGroup.style('opacity', n => connectedNames.has(n.name) ? 1.0 : 0.2);
        link.style('stroke-opacity', l => {
          const sName = typeof l.source === 'object' ? l.source.name : l.source;
          const tName = typeof l.target === 'object' ? l.target.name : l.target;
          return (sName === d.name || tName === d.name) ? 0.9 : 0.05;
        });
      })
      .on('mouseout', () => {
        setHoveredNode(null);
        nodeGroup.style('opacity', 1.0);
        link.style('stroke-opacity', 0.6);
      });

    // Background click resets selection
    svg.on('click', () => {
      onSelectEntity(null);
    });

    // Simulation Tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimulationNode).x || 0)
        .attr('y1', d => (d.source as SimulationNode).y || 0)
        .attr('x2', d => (d.target as SimulationNode).x || 0)
        .attr('y2', d => (d.target as SimulationNode).y || 0);

      nodeGroup.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredData, selectedEntity]);

  // Zoom control helpers
  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, factor);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-140px)] min-h-[600px] bg-slate-950 overflow-hidden flex flex-col">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-800 p-2 rounded-xl shadow-lg">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search entity, core, protocol..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
          />
        </div>

        {/* Entity Type Filter */}
        <div className="flex items-center space-x-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 py-1 px-2 rounded-md focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Types (61)</option>
            <option value="COMPONENT">Component (10)</option>
            <option value="MANUFACTURER">Manufacturer (9)</option>
            <option value="PROTOCOL">Protocol (32)</option>
            <option value="CORE_ARCHITECTURE">Core Architecture (10)</option>
          </select>
        </div>

        {/* Community Filter */}
        <div className="flex items-center space-x-1">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select
            value={communityFilter}
            onChange={e => setCommunityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 py-1 px-2 rounded-md focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Leiden Clusters (8)</option>
            {communities.map(c => (
              <option key={c.id} value={c.id.toString()}>
                #{c.id} {c.title} ({c.entities.length})
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(typeFilter !== 'ALL' || communityFilter !== 'ALL' || searchTerm) && (
          <button
            onClick={() => {
              setTypeFilter('ALL');
              setCommunityFilter('ALL');
              setSearchTerm('');
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 underline font-mono"
          >
            Reset
          </button>
        )}
      </div>

      {/* Floating Zoom & Pan Controls */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-1 bg-slate-900/90 backdrop-blur border border-slate-800 p-1.5 rounded-lg shadow-md">
        <button
          onClick={() => handleZoom(1.3)}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.7)}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Graph Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-lg shadow-md text-xs space-y-1.5 font-mono">
        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Entity Legend</span>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300">Component (MCU / SoC)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-300">Manufacturer</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-300">Hardware Protocol</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span className="text-slate-300">Core Architecture</span>
        </div>
        <div className="border-t border-slate-800 pt-1.5 text-[10px] text-slate-400">
          Showing: {filteredData.nodes.length} nodes / {filteredData.links.length} edges
        </div>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredNode && (
        <div className="absolute top-20 left-4 z-20 bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-lg shadow-xl text-xs max-w-sm pointer-events-none">
          <div className="flex items-center space-x-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getNodeColor(hoveredNode.type) }}
            ></span>
            <span className="font-bold text-white">{hoveredNode.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">({hoveredNode.type})</span>
          </div>
          <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">
            {hoveredNode.description}
          </p>
          <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Connections: {hoveredNode.degree}</span>
            <span>Cluster: #{hoveredNode.community}</span>
          </div>
        </div>
      )}

      {/* D3 SVG Canvas */}
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
