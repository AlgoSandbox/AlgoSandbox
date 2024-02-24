import { SandboxAdapter } from '@algo-sandbox/core/adapter';
import { counterState, graphSearchAlgorithmState } from '@algo-sandbox/states';

const counterToSearchGraph: SandboxAdapter<
  typeof counterState,
  typeof graphSearchAlgorithmState
> = {
  accepts: counterState,
  outputs: graphSearchAlgorithmState,
  transform: ({ counter }) => {
    const nodeCount = Math.max(1, counter);
    return {
      graph: {
        nodes: Array.from({ length: nodeCount }, (_, i) => ({
          id: i.toString(),
        })),
        edges: Array.from({ length: nodeCount }, (_, i) => ({
          source: i.toString(),
          target: ((i + 1) % nodeCount).toString(),
        })),
        directed: false,
      },
      visited: new Set(
        Array.from({ length: nodeCount - 1 }, (_, i) => i.toString()),
      ),
      toVisit: [],
      currentNodeId: (nodeCount - 1).toString(),
      initialNodeId: '0',
    };
  },
};

export default counterToSearchGraph;
