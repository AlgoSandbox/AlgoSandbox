/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createParameterizedVisualizer,
  SandboxParam,
  SandboxParameterizedVisualizer,
  SandboxParameters,
  SandboxState,
} from '@algo-sandbox/core';
import {
  nodeGraphVisualizerEdge,
  nodeGraphVisualizerInput,
  nodeGraphVisualizerNode,
} from '@algo-sandbox/states';
import * as d3 from 'd3';
import { D3DragEvent } from 'd3';
import { cloneDeep, isEqual } from 'lodash';
import { z } from 'zod';

type NodeGraph = SandboxState<typeof nodeGraphVisualizerInput>;
type GraphNode = z.infer<typeof nodeGraphVisualizerNode>;
type GraphEdge = z.infer<typeof nodeGraphVisualizerEdge>;

type RawRenderFunction = (
  selection: d3.Selection<d3.BaseType, GraphNode, d3.BaseType, unknown>,
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
  links: Array<GraphEdge>;
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>;
  width: number;
  height: number;
  zoomTransform: d3.ZoomTransform;
};

const getVisualizerState = (
  graph: NodeGraph,
  oldNodes: Array<GraphNode>,
  oldLinks: Array<z.infer<typeof nodeGraphVisualizerEdge>>,
): Pick<NodeGraphVisualizerState, 'nodes' | 'links' | 'simulation'> => {
  const { nodes: newNodes, edges } = cloneDeep(graph);
  const nodes = newNodes.map((node) => {
    const oldNode = oldNodes.find(({ id: oldId }) => node.id === oldId);
    return oldNode ? { ...oldNode } : node;
  });

  const newLinks = [...edges];
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
  const { nodeDepths } = graph;
  const isTree = nodeDepths !== undefined;

  let simulation = d3
    .forceSimulation(nodes as d3.SimulationNodeDatum[])
    .force('charge', d3.forceManyBody().strength(isTree ? -700 : -700))
    .force(
      'link',
      d3
        .forceLink<
          d3.SimulationNodeDatum & GraphNode,
          d3.SimulationLinkDatum<d3.SimulationNodeDatum & GraphNode>
        >(links)
        .id((d) => d.id)
        .distance(100)
        .strength(1),
    )
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  if (nodeDepths) {
    const maxDepth = Math.max(...Object.values(nodeDepths));
    const minDepth = Math.min(...Object.values(nodeDepths));

    const normalizeDepth = (depth: number) => {
      return (depth - minDepth) / (maxDepth - minDepth) - 0.5;
    };

    simulation = simulation.force(
      'tree',
      d3
        .forceY((d: any) => {
          return normalizeDepth(nodeDepths[d.id] ?? 0) * 400;
        })
        .strength((d) => (nodeDepths[d.id] !== undefined ? 1 : 0)),
    );
  }

  return {
    simulation,
    nodes,
    links,
  };
};

const nodeGraphVisualizer: SandboxParameterizedVisualizer<
  typeof nodeGraphVisualizerInput,
  NodeGraphVisualizerState,
  NodeGraphVisualizationParameters
> = (() => {
  return createParameterizedVisualizer(
    (() => {
      return {
        name: 'Node graph',
        accepts: nodeGraphVisualizerInput,
        parameters: {
          renderNode: SandboxParam.callback<(node: NodeGraphSVGNode) => void>(
            'Node render function',
            () => {},
          ),
        },
        onUpdate: ({
          parameters,
          element,
          width,
          height,
          state: graph,
          previousVisualizerState,
        }) => {
          d3.select(element).selectAll('svg').data([0]).enter().append('svg');

          const svg = d3
            .select(element)
            .select('svg')
            .attr('viewBox', [-width / 2, -height / 2, width, height]);
          svg.selectAll('g').data([0]).enter().append('g');

          const g = svg.select('g');
          g.selectChildren().remove();

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

          svg
            .attr('style', 'cursor: grab')
            .call(d3.zoom().on('zoom', zoomed) as any);

          function zoomed({
            transform,
          }: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
            g.attr('transform', transform as any);
          }

          const zoomTransform = d3.zoomTransform(g.node() as any);

          const markerBoxWidth = 4;
          const markerBoxHeight = 4;
          const refX = markerBoxWidth / 2;
          const refY = markerBoxHeight / 2;
          const arrowPoints: [number, number][] = [
            [0, 0],
            [0, markerBoxHeight],
            [markerBoxWidth, markerBoxHeight / 2],
          ];
          svg
            .selectAll('#arrow')
            .data([0])
            .enter()
            .append('defs')
            .append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
            .attr('refX', refX)
            .attr('refY', refY)
            .attr('markerWidth', markerBoxWidth)
            .attr('markerHeight', markerBoxHeight)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', d3.line()(arrowPoints))
            .attr('fill', 'rgb(var(--color-border))');

          // Create links
          g.selectAll('.link')
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('stroke', 'rgb(var(--color-border))')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .filter((d) => d.isArrow ?? false)
            .attr('marker-end', 'url(#arrow)');

          // Create nodes
          const node = g
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
          g.selectAll('.label')
            .data(nodes)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('fill', 'rgb(var(--color-on-surface))')
            .attr('text-anchor', 'middle')
            .text((d) => d.label ?? d.id)
            .attr('dy', 15 / 2)
            .attr('style', 'pointer-events: none');

          // Add labels to links
          g.selectAll('.link-label')
            .data(links)
            // .filter((d) => d.label !== undefined)
            .enter()
            .append('text')
            .attr('class', 'link-label')
            .attr('fill', 'rgb(var(--color-label))')
            .attr('text-anchor', 'middle')
            .text((d) => d.label ?? '')
            .attr('style', 'pointer-events: none')
            .attr('font-size', 10);

          // Update the positions of nodes, links, and labels here
          const updateValues = () => {
            function getTargetNodeCircumferencePoint(d: any) {
              const [midPointX, midPointY] = getMidPoint(d);
              const t_radius = 20;
              const dx = d.target.x - midPointX;
              const dy = d.target.y - midPointY;
              const gamma = Math.atan2(dy, dx); // Math.atan2 returns the angle in the correct quadrant as opposed to Math.atan
              const tx = d.target.x - Math.cos(gamma) * t_radius;
              const ty = d.target.y - Math.sin(gamma) * t_radius;

              return [tx, ty];
            }

            function getMidPoint(d: any) {
              const sourceX = d.source.x;
              const sourceY = d.source.y;
              const targetX = d.target.x;
              const targetY = d.target.y;

              const dx = targetX - sourceX;
              const dy = targetY - sourceY;

              const tangentAngle = Math.atan2(-dx, dy);
              const offsetX = Math.cos(tangentAngle) * 20;
              const offsetY = Math.sin(tangentAngle) * 20;

              const midPointX = (d.source.x + d.target.x) / 2 + offsetX;
              const midPointY = (d.source.y + d.target.y) / 2 + offsetY;

              return [midPointX, midPointY] as const;
            }

            g.selectAll('.link')
              .data(links)
              .attr('d', (d: any) => {
                const isArrow = d.isArrow ?? false;
                const [midPointX, midPointY] = getMidPoint(d);

                const path = d3.path();
                path.moveTo(d.source.x, d.source.y);
                path.quadraticCurveTo(
                  midPointX,
                  midPointY,
                  isArrow ? getTargetNodeCircumferencePoint(d)[0] : d.target.x,
                  isArrow ? getTargetNodeCircumferencePoint(d)[1] : d.target.y,
                );
                return path.toString();
              });

            const svgNodes = g.selectAll('.node').data(nodes);
            svgNodes
              .attr('fill', 'var(--color-surface)')
              .attr('cx', (d: any) => d.x)
              .attr('cy', (d: any) => d.y);

            let rawNodeRender = null as RawRenderFunction | null;

            const node: NodeGraphSVGNode = {
              fill: (getFill) => {
                svgNodes.attr('fill', (node) => getFill(node) ?? null);
                return node;
              },
              textColor: (getTextColor) => {
                g.selectAll('.label')
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

            // Update labels
            g.selectAll('.label')
              .data(nodes)
              .attr('x', (d: any) => d.x)
              .attr('y', (d: any) => d.y);

            // Update link labels
            g.selectAll('.link-label')
              .data(links)
              // .filter((d) => d.label !== undefined)
              .attr('x', (d: any) => getMidPoint(d)[0])
              .attr('y', (d: any) => getMidPoint(d)[1])
              .attr('transform', (d: any) => {
                const [midPointX, midPointY] = getMidPoint(d);
                let angle =
                  Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x) *
                  (180 / Math.PI);

                if (angle > 90 || angle < -90) {
                  angle = angle - 180;
                }

                return `rotate(${angle}, ${midPointX}, ${midPointY})`;
              });
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
            zoomTransform,
          };
        },
      };
    })(),
  );
})();

export default nodeGraphVisualizer;
