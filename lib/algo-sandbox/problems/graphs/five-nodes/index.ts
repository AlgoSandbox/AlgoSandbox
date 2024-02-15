import { SandboxProblem } from '@algo-sandbox/core';
import { searchGraph, undirectedGraph } from '@algo-sandbox/states';
import { z } from 'zod';

type UndirectedGraph = z.infer<typeof undirectedGraph.shape>;

const fiveNodesGraph = {
  nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
  edges: [
    ['A', 'B'],
    ['B', 'C'],
    ['B', 'D'],
    ['D', 'E'],
    ['A', 'E'],
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
