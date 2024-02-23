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
      nodes: value,
      currentNodeId: value.getStateKey(value.currentState),
      toVisit: value.toVisit.map(value.getStateKey),
      visited: value.visited,
    };
  },
};

export default envToGraph;
