import { createAdapter, createState } from '@algo-sandbox/core';
import {
  graphSearchAlgorithmState,
  NodeGraphVisualizerNode,
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
} from '@algo-sandbox/states';
import type { Dom } from '@svgdotjs/svg.js';
import { z } from 'zod';

const inputState = createState(
  'Environment to search tree input state',
  sandboxEnvironmentSearchState.shape.extend({
    getStateKey: sandboxEnvironmentState.shape.shape.getStateKey,
    render: sandboxEnvironmentState.shape.shape.render,
  }),
);

type GraphNode = NodeGraphVisualizerNode;
type GraphEdge = z.infer<
  (typeof graphSearchAlgorithmState)['shape']
>['graph']['edges'][number];

const envToGraph = createAdapter({
  accepts: inputState,
  outputs: graphSearchAlgorithmState,
  transform: (value) => {
    function createGraph(): {
      nodes: GraphNode[];
      edges: GraphEdge[];
      nodeDepths: Record<string, number>;
    } {
      const root = value.searchTree;
      const nodes: Array<GraphNode> = [];
      const edges: Array<GraphEdge> = [];
      const nodeDepths: Record<string, number> = {};

      if (root === null) {
        return { nodes, edges, nodeDepths };
      }

      const frontier = [{ node: root, depth: 0 }];

      while (frontier.length > 0) {
        const current = frontier.shift();
        if (current === undefined) break;

        const { node: currentNode, depth } = current;
        const { id, children } = currentNode;

        nodes.push({
          id,
          createElement: () => {
            const dom = value.render(value.currentState) as Dom;
            return dom.node as SVGElement;
          },
        });
        nodeDepths[id] = depth;

        for (const child of children) {
          frontier.push({ node: child, depth: depth + 1 });
          edges.push({
            source: currentNode.id,
            target: child.id,
            label: child.action ?? undefined,
          });
        }
      }

      return { nodes, edges, nodeDepths };
    }
    const { nodes, edges, nodeDepths } = createGraph();

    return {
      graph: {
        nodes,
        edges,
        directed: true,
      },
      nodeDepths,
      currentNodeId: value.getStateKey(value.currentState),
      initialNodeId: value.getStateKey(value.initialState),
      frontier: value.frontier.map(({ state }) => value.getStateKey(state)),
      visited: value.visited,
    };
  },
});

export default envToGraph;
