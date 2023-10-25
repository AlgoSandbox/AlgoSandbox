/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createParameteredVisualizer,
  SandboxParam,
  SandboxParameteredVisualizer,
  SandboxParameters,
} from '@algo-sandbox/core';
import { GraphNode, NodeGraph } from '@algo-sandbox/problems/graphs';
import * as d3 from 'd3';
import _ from 'lodash';

type RawRenderFunction = (
  selection: d3.Selection<d3.BaseType, GraphNode, SVGSVGElement | null, unknown>
) => void;

type NodeGraphSVGNodeInternal<OmittedKeys extends string = ''> = Omit<
  {
    fill: (
      getFill: (node: GraphNode) => string | undefined
    ) => NodeGraphSVGNodeInternal<OmittedKeys | 'fill'>;
    raw: (render: RawRenderFunction) => void;
  },
  OmittedKeys
>;

type NodeGraphSVGNode = NodeGraphSVGNodeInternal;

type NodeGraphVisualizationParameters = SandboxParameters<{
  renderNode: (node: NodeGraphSVGNode) => void;
}>;

declare module '@algo-sandbox/core' {
  export interface SandboxStateNameMap {
    nodeGraph: NodeGraph;
  }
}

const nodeGraphVisualizer: SandboxParameteredVisualizer<
  'nodeGraph',
  NodeGraphVisualizationParameters
> = (() => {
  return createParameteredVisualizer(
    (() => {
      let visualizerState: ReturnType<typeof getVisualizerState>;
      let cachedGraph: NodeGraph;
      let cachedWidth: number;
      let cachedHeight: number;

      const getVisualizerState = (
        graph: NodeGraph,
        oldNodes: Array<GraphNode>,
        oldLinks: Array<{
          source: string | number;
          target: string | number;
        }>
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
              .strength(1)
          );

        return {
          simulation,
          nodes,
          edges,
          links,
        };
      };

      return {
        name: 'Node graph',
        accepts: 'nodeGraph',
        parameters: {
          renderNode: SandboxParam.callback('Node render function', () => {}),
        },
        onUpdate: ({ parameters, svg, width, height, state: graph }) => {
          if (!visualizerState || !_.isEqual(graph, cachedGraph)) {
            // Clear canvas and re-render nodes
            svg.selectChildren().remove();
            if (visualizerState?.simulation) {
              visualizerState?.simulation.stop();
            }
            visualizerState = getVisualizerState(
              graph,
              visualizerState?.nodes ?? [],
              visualizerState?.links ?? []
            );
            cachedGraph = graph;
          }

          const { nodes, links, simulation } = visualizerState;

          // Add force to center nodes
          simulation.force('center', d3.forceCenter(width / 2, height / 2));

          // Only re-heat the simulation if required
          if (width !== cachedWidth || height !== cachedHeight) {
            cachedWidth = width;
            cachedHeight = height;

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
            .attr('stroke', 'black')
            .attr('stroke-width', 2);

          // Create nodes
          svg
            .selectAll('.node')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 15)
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
            .text((d) => d.id)
            .attr('dy', 15 / 2);

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
        },
      };
    })()
  );
})();

export default nodeGraphVisualizer;
