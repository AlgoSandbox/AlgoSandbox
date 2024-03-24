import { createAdapter, createState } from '@algo-sandbox/core';
import {
  graphSearchAlgorithmState,
  NodeGraphVisualizerNode,
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
} from '@algo-sandbox/states';
import { compact } from 'lodash';

const inputState = createState(
  'Environment to search graph input state',

  sandboxEnvironmentSearchState.shape.extend({
    getStateKey: sandboxEnvironmentState.shape.shape.getStateKey,
  }),
);

const envToGraph = createAdapter({
  accepts: inputState,
  outputs: graphSearchAlgorithmState,
  transform: (value) => {
    function getDepths(): Record<string, number> {
      const depths: Record<string, number> = {};

      const current = value.getStateKey(value.initialState);
      const visited = new Set();
      const frontier = [{ node: current, depth: 0 }];

      while (frontier.length > 0) {
        const popped = frontier.shift();
        if (popped === undefined) break;

        const { node: current, depth } = popped;
        depths[current] = depth;
        visited.add(current);
        value.searchTree
          .filter((edge) => edge.source === current)
          .forEach(({ result }) => {
            if (result === undefined) return;
            if (visited.has(result)) return;
            visited.add(result);
            frontier.push({ node: result, depth: depth + 1 });
          });
      }

      return depths;
    }
    const nodeDepths = getDepths();

    const visitedNodes = Array.from(value.visited);
    const searchTreeNodes = compact(
      value.searchTree.flatMap(({ source, result }) => [source, result]),
    );

    return {
      graph: {
        nodes: Array.from(new Set([...visitedNodes, ...searchTreeNodes])).map(
          (node) => ({ id: node }) satisfies NodeGraphVisualizerNode,
        ),
        edges: value.searchTree.map(({ source, result, action }) => {
          return {
            source,
            target: result ?? '',
            label: action,
          };
        }),
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
