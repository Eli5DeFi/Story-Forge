'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Character {
  id: string;
  name: string;
  status: string;
  imageUrl?: string;
}

interface Relationship {
  id: string;
  characterAId: string;
  characterBId: string;
  relationship: string;
  strength: number;
}

interface RelationshipDiagramProps {
  characters: Character[];
  relationships: Relationship[];
  onCharacterClick?: (characterId: string) => void;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  status: string;
  imageUrl?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  id: string;
  relationship: string;
  strength: number;
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  ally: '#22c55e',
  friend: '#3b82f6',
  family: '#a855f7',
  enemy: '#ef4444',
  rival: '#f97316',
  lover: '#ec4899',
  mentor: '#06b6d4',
  neutral: '#6b7280',
};

export function RelationshipDiagram({
  characters,
  relationships,
  onCharacterClick,
}: RelationshipDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(500, containerRef.current.clientHeight),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || characters.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Prepare data
    const nodes: Node[] = characters.map((char) => ({
      id: char.id,
      name: char.name,
      status: char.status,
      imageUrl: char.imageUrl,
    }));

    const links: Link[] = relationships.map((rel) => ({
      id: rel.id,
      source: rel.characterAId,
      target: rel.characterBId,
      relationship: rel.relationship,
      strength: rel.strength,
    }));

    // Create container group for zoom
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(150)
          .strength((d) => d.strength * 0.5),
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Create arrow markers for directed relationships
    svg
      .append('defs')
      .selectAll('marker')
      .data(['ally', 'friend', 'family', 'enemy', 'rival', 'lover', 'mentor', 'neutral'])
      .enter()
      .append('marker')
      .attr('id', (d) => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', (d) => RELATIONSHIP_COLORS[d] || RELATIONSHIP_COLORS.neutral);

    // Draw links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => RELATIONSHIP_COLORS[d.relationship.toLowerCase()] || RELATIONSHIP_COLORS.neutral)
      .attr('stroke-width', (d) => 1 + d.strength)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', (d) => `url(#arrow-${d.relationship.toLowerCase()})`);

    // Draw link labels
    const linkLabel = g
      .append('g')
      .selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px')
      .text((d) => d.relationship);

    // Draw nodes
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, Node>()
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
          }),
      )
      .on('click', (event, d) => {
        if (onCharacterClick) {
          onCharacterClick(d.id);
        }
      });

    // Node circles with gradient
    node
      .append('circle')
      .attr('r', 30)
      .attr('fill', (d) =>
        d.status === 'deceased' ? '#374151' : '#1e293b',
      )
      .attr('stroke', (d) =>
        d.status === 'deceased' ? '#ef4444' : '#f59e0b',
      )
      .attr('stroke-width', 2);

    // Node images (clip to circle)
    node
      .append('clipPath')
      .attr('id', (d) => `clip-${d.id}`)
      .append('circle')
      .attr('r', 28);

    node
      .filter((d) => !!d.imageUrl)
      .append('image')
      .attr('xlink:href', (d) => d.imageUrl!)
      .attr('x', -28)
      .attr('y', -28)
      .attr('width', 56)
      .attr('height', 56)
      .attr('clip-path', (d) => `url(#clip-${d.id})`);

    // Fallback icon for nodes without images
    node
      .filter((d) => !d.imageUrl)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '20px')
      .attr('fill', '#6b7280')
      .text('👤');

    // Node labels
    node
      .append('text')
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e5e7eb')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text((d) => d.name.length > 15 ? d.name.slice(0, 15) + '...' : d.name);

    // Status indicator
    node
      .filter((d) => d.status === 'deceased')
      .append('text')
      .attr('y', 58)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ef4444')
      .attr('font-size', '10px')
      .text('(Deceased)');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as Node).x!)
        .attr('y1', (d) => (d.source as Node).y!)
        .attr('x2', (d) => (d.target as Node).x!)
        .attr('y2', (d) => (d.target as Node).y!);

      linkLabel
        .attr('x', (d) => ((d.source as Node).x! + (d.target as Node).x!) / 2)
        .attr('y', (d) => ((d.source as Node).y! + (d.target as Node).y!) / 2);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Store zoom for controls
    (svgRef.current as any).__zoom = zoom;
    (svgRef.current as any).__svg = svg;

    return () => {
      simulation.stop();
    };
  }, [characters, relationships, dimensions, onCharacterClick]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = (svgRef.current as any).__zoom;
      svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = (svgRef.current as any).__zoom;
      svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = (svgRef.current as any).__zoom;
      svg
        .transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity);
    }
  };

  if (characters.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-border bg-card">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No characters to display</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[600px] w-full">
      {/* Controls */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleReset}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-border bg-card/90 p-3 backdrop-blur">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Relationships</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(RELATIONSHIP_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="h-2 w-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-xl border border-border bg-background"
      />
    </div>
  );
}
