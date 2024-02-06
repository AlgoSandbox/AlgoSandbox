/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createParameterizedVisualizer,
  SandboxParam,
  SandboxParameterizedVisualizer,
  SandboxParameters,
} from '@algo-sandbox/core';
import { graphNode, nodeGraph } from '@algo-sandbox/states';
import * as d3 from 'd3';
import { D3DragEvent } from 'd3';
import _, { isEqual } from 'lodash';
import { z } from 'zod';

type NodeGraph = z.infer<typeof nodeGraph.shape>;
type GraphNode = z.infer<typeof graphNode>;

type RawRenderFunction = (
  selection: d3.Selection<
    d3.BaseType,
    GraphNode,
    SVGSVGElement | null,
    unknown
  >,
) => void;

type NodeGraphSVGNodeInternal<OmittedKeys extends string = ''> = Omit<
  {
    fill: (
      getFill: (node: GraphNode) => string | undefined,
    ) => NodeGraphSVGNodeInternal<OmittedKeys | 'fill'>;
    textColor: (
      getTextColor: (node: GraphNode) => string | undefined,
    ) => NodeGraphSVGNodeInternal<OmittedKeys | 'textColor'>;
    strokeColor: (
      getStrokeColor: (node: GraphNode) => string | undefined,
    ) => NodeGraphSVGNodeInternal<OmittedKeys | 'strokeColor'>;
    raw: (render: RawRenderFunction) => void;
  },
  OmittedKeys
>;

type NodeGraphSVGNode = NodeGraphSVGNodeInternal;

type NodeGraphVisualizationParameters = SandboxParameters<{
  renderNode: (node: NodeGraphSVGNode) => void;
}>;

export type NodeGraphVisualizerState = {
  graph: NodeGraph;
  nodes: Array<GraphNode>;
  links: Array<{
    source: string | number;
    target: string | number;
  }>;
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>;
  width: number;
  height: number;
};

const getVisualizerState = (
  graph: NodeGraph,
  oldNodes: Array<GraphNode>,
  oldLinks: Array<{
    source: string | number;
    target: string | number;
  }>,
) => {
  const { nodes: newNodes, edges } = _.cloneDeep(graph);
  const nodes = newNodes.map((node) => {
    const oldNode = oldNodes.find(({ id: oldId }) => node.id === oldId);
    return oldNode ? { ...oldNode } : node;
  });

  const newLinks = edges.map(([source, target]) => ({
    source,
    target,
  }));
  const links = newLinks.map((link) => {
    const oldLink = oldLinks.find(({ source, target }) => {
      if (typeof source === 'string' && typeof target === 'string') {
        return (
          (source as any).id === link.source &&
          (target as any).id === link.target
        );
      } else {
        return (
          (source as any).index === link.source &&
          (target as any).index === link.target
        );
      }
    });

    return oldLink ? { ...oldLink } : link;
  });

  // Create a force simulation to spread the nodes
  const simulation = d3
    .forceSimulation(nodes as d3.SimulationNodeDatum[])
    .force('charge', d3.forceManyBody().strength(-300))
    .force(
      'link',
      d3
        .forceLink<
          d3.SimulationNodeDatum & GraphNode,
          d3.SimulationLinkDatum<d3.SimulationNodeDatum & GraphNode>
        >(links)
        .id((d) => d.id)
        .distance(40)
        .strength(1),
    )
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  return {
    simulation,
    nodes,
    edges,
    links,
  };
};

const nodeGraphVisualizer: SandboxParameterizedVisualizer<
  typeof nodeGraph,
  NodeGraphVisualizerState,
  NodeGraphVisualizationParameters
> = (() => {
  return createParameterizedVisualizer(
    (() => {
      return {
        name: 'Node graph',
        accepts: nodeGraph,
        parameters: {
          renderNode: SandboxParam.callback<(node: NodeGraphSVGNode) => void>(
            'Node render function',
            () => {},
          ),
        },
        onUpdate: ({
          parameters,
          svg,
          width,
          height,
          state: graph,
          previousVisualizerState,
        }) => {
          const visualizerState = (() => {
            if (
              previousVisualizerState &&
              isEqual(previousVisualizerState.graph, graph)
            ) {
              return previousVisualizerState;
            }
            return getVisualizerState(
              graph,
              previousVisualizerState?.nodes ?? [],
              previousVisualizerState?.links ?? [],
            );
          })();

          const { nodes, links, simulation } = visualizerState;

          // Only re-heat the simulation if required
          if (
            width !== previousVisualizerState?.width ||
            height !== previousVisualizerState?.height
          ) {
            if (simulation.alpha() <= simulation.alphaMin()) {
              simulation.restart();
            }
          }

          // Create links
          svg
            .selectAll('.link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', 'rgb(var(--color-border))')
            .attr('stroke-width', 2);

          // Create nodes
          const node = svg
            .selectAll('.node')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('stroke', 'rgb(var(--color-border))')
            .attr('stroke-width', 2)
            .attr('style', 'cursor: grab');

          node.call(
            d3
              .drag()
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended) as any,
          );

          // Reheat the simulation when drag starts, and fix the subject position.
          function dragstarted(
            event: D3DragEvent<
              SVGCircleElement,
              d3.SimulationNodeDatum,
              d3.SimulationNodeDatum
            >,
          ) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          }

          // Update the subject (dragged node) position during drag.
          function dragged(
            event: D3DragEvent<
              SVGCircleElement,
              d3.SimulationNodeDatum,
              d3.SimulationNodeDatum
            >,
          ) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          }

          // Restore the target alpha so the simulation cools after dragging ends.
          // Unfix the subject position now that it’s no longer being dragged.
          function dragended(
            event: D3DragEvent<
              SVGCircleElement,
              d3.SimulationNodeDatum,
              d3.SimulationNodeDatum
            >,
          ) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          }

          // Add labels to nodes
          svg
            .selectAll('.label')
            .data(nodes)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('fill', 'rgb(var(--color-on-surface))')
            .attr('text-anchor', 'middle')
            .text((d) => d.id)
            .attr('dy', 15 / 2)
            .attr('style', 'pointer-events: none');

          const updateValues = () => {
            // Update the positions of nodes, links, and labels here
            svg
              .selectAll('.link')
              .data(links)
              .attr('x1', (d: any) => d.source.x)
              .attr('y1', (d: any) => d.source.y)
              .attr('x2', (d: any) => d.target.x)
              .attr('y2', (d: any) => d.target.y);

            const svgNodes = svg.selectAll('.node').data(nodes);
            svgNodes
              .attr('fill', 'white')
              .attr('cx', (d: any) => d.x)
              .attr('cy', (d: any) => d.y);

            let rawNodeRender = null as RawRenderFunction | null;

            const node: NodeGraphSVGNode = {
              fill: (getFill) => {
                svgNodes.attr('fill', (node) => getFill(node) ?? null);
                return node;
              },
              textColor: (getTextColor) => {
                svg
                  .selectAll('.label')
                  .data(nodes)
                  .attr('fill', (node) => getTextColor(node) ?? null);
                return node;
              },
              strokeColor: (getStrokeColor) => {
                svgNodes.attr('stroke', (node) => getStrokeColor(node) ?? null);
                return node;
              },
              raw: (render) => {
                rawNodeRender = render;
              },
            };

            // Render node using exposed APIs
            parameters.renderNode?.(node);

            // Call raw render function if applicable
            rawNodeRender?.(svgNodes);

            svg
              .selectAll('.label')
              .data(nodes)
              .attr('x', (d: any) => d.x)
              .attr('y', (d: any) => d.y);
          };

          simulation.on('tick', updateValues);
          updateValues();

          return {
            graph,
            nodes,
            links,
            simulation,
            width,
            height,
          };
        },
      };
    })(),
  );
})();

export default nodeGraphVisualizer;
