import { SandboxAdapter } from '@algo-sandbox/core';
import {
  graphSearchAlgorithmState,
  sandboxEnvironmentSearchState,
} from '@algo-sandbox/states';

const envToGraph: SandboxAdapter<
  typeof sandboxEnvironmentSearchState,
  typeof graphSearchAlgorithmState
> = {
  accepts: sandboxEnvironmentSearchState,
  outputs: graphSearchAlgorithmState,
  transform: (value) => {
    function getDepths(): Record<string, number> {
      const depths: Record<string, number> = {};

      const current = value.getStateKey(value.initialState);
      const visited = new Set();
      const toVisit = [{ node: current, depth: 0 }];

      while (toVisit.length > 0) {
        const popped = toVisit.shift();
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
            toVisit.push({ node: result, depth: depth + 1 });
          });
      }

      return depths;
    }
    const nodeDepths = getDepths();

    return {
      graph: {
        nodes: Array.from(value.visited).map((node) => ({ id: node })),
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
      toVisit: value.toVisit.map(({ state }) => value.getStateKey(state)),
      visited: value.visited,
    };
  },
};

export default envToGraph;
