import { SandboxProblem } from '@algo-sandbox/core';
import { searchGraph, undirectedGraph } from '@algo-sandbox/states';
import { z } from 'zod';

type UndirectedGraph = z.infer<typeof undirectedGraph.shape>;

const tenNodesGraph = {
  nodes: 'ABCDEFGHIJ'.split('').map((id) => ({ id })),
  edges: [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'B', target: 'D' },
    { source: 'D', target: 'E' },
    { source: 'A', target: 'E' },
    { source: 'A', target: 'F' },
    { source: 'E', target: 'G' },
    { source: 'F', target: 'I' },
    { source: 'F', target: 'J' },
    { source: 'J', target: 'H' },
    { source: 'I', target: 'H' },
  ],
  directed: false,
} satisfies UndirectedGraph;

const tenNodes = {
  name: 'Ten nodes',
  type: searchGraph,
  getInitialState: () => ({
    ...tenNodesGraph,
    startId: 'A',
    endId: 'H',
  }),
} satisfies SandboxProblem<typeof searchGraph>;

export default tenNodes;
