import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { NodeGraph, UndirectedGraph } from '../problems/graphs';
import { GraphNode } from '../problems/graphs';

interface NodeGraphVisualizationProps<K> {
  graph: NodeGraph<K>;
  getNodeFill?: (node: K) => string | undefined;
}

export default function NodeGraphVisualization<K extends string | number>({
  graph,
  getNodeFill,
}: NodeGraphVisualizationProps<K>) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { nodes, edges } = useMemo(() => _.cloneDeep(graph), [graph]);
  const links = useMemo(
    () =>
      edges.map(([source, target]) => ({
        source,
        target,
      })),
    [edges]
  );

  useEffect(() => {
    // Define the dimensions of the SVG container
    const width = 600;
    const height = 400;

    // Create an SVG element
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create a force simulation for the directed graph
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('charge', d3.forceManyBody().strength(-500))
      .force(
        'link',
        d3
          .forceLink<
            d3.SimulationNodeDatum & GraphNode<K>,
            d3.SimulationLinkDatum<d3.SimulationNodeDatum & GraphNode<K>>
          >(
            links as unknown as d3.SimulationLinkDatum<
              d3.SimulationNodeDatum & GraphNode<K>
            >[]
          )
          .id((d) => d.id)
          .distance(40 * 2)
      )
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create links
    svg
      .selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    // Create nodes
    svg
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 20)
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    // Add labels to nodes
    svg
      .selectAll('.label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .text((d) => d.id);

    simulation.stop();
    simulation.tick(1000);
  }, [graph, links, nodes]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // Update the positions of nodes, links, and labels here
    svg
      .selectAll('.link')
      .data(links)
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    svg
      .selectAll('.node')
      .data(nodes)
      .attr('fill', (node) => getNodeFill?.(node.id) ?? 'white')
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y);

    svg
      .selectAll('.label')
      .data(nodes)
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y);
  }, [graph, getNodeFill, links, nodes]);

  return <svg ref={svgRef}></svg>;
}
