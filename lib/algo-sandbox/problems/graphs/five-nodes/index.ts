import { SandboxProblem } from '@algo-sandbox/core';
import { searchGraph, undirectedGraph } from '@algo-sandbox/states';
import { z } from 'zod';

type UndirectedGraph = z.infer<typeof undirectedGraph.shape>;

const fiveNodesGraph = {
  nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'B', target: 'D' },
    { source: 'D', target: 'E' },
    { source: 'A', target: 'E' },
  ],
  directed: false,
} satisfies UndirectedGraph;

const fiveNodes = {
  name: 'Five nodes',
  type: searchGraph,
  getInitialState: () => ({
    ...fiveNodesGraph,
    startId: 'A',
    endId: 'D',
  }),
} satisfies SandboxProblem<typeof searchGraph>;

export default fiveNodes;
