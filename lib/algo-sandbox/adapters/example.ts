import { SandboxAdapter } from '../core/adapter';

export const counterToSearchGraphStateAdapter: SandboxAdapter<
  'counter',
  'graphSearchAlgorithmState'
> = {
  accepts: 'counter',
  outputs: 'graphSearchAlgorithmState',
  transform: ({ counter }) => {
    const nodeCount = Math.max(1, counter);
    return {
      _stateName: 'graphSearchAlgorithmState',
      graph: {
        nodes: Array.from({ length: nodeCount }, (_, i) => ({
          id: i.toString(),
        })),
        edges: Array.from({ length: nodeCount }, (_, i) => [
          i.toString(),
          ((i + 1) % nodeCount).toString(),
        ]),
        startId: '',
        endId: '',
        directed: false,
      },
      visited: new Set(
        Array.from({ length: nodeCount - 1 }, (_, i) => i.toString())
      ),
      toVisit: [],
      currentNodeId: (nodeCount - 1).toString(),
    };
  },
};

export const searchGraphStateToCounterAdapter: SandboxAdapter<
  'graphSearchAlgorithmState',
  'counter'
> = {
  accepts: 'graphSearchAlgorithmState',
  outputs: 'counter',
  transform: (value) => {
    return {
      _stateName: 'counter',
      counter: value.visited.size,
    };
  },
};
