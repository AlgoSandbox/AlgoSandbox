import { SandboxProblem } from '@algo-sandbox/core';
import { searchGraph, undirectedGraph } from '@algo-sandbox/states';
import { z } from 'zod';

type UndirectedGraph = z.infer<typeof undirectedGraph.shape>;

const tenNodesGraph = {
  nodes: 'ABCDEFGHIJ'.split('').map((id) => ({ id })),
  edges: [
    ['A', 'B'],
    ['B', 'C'],
    ['B', 'D'],
    ['D', 'E'],
    ['A', 'E'],
    ['A', 'F'],
    ['E', 'G'],
    ['F', 'I'],
    ['F', 'J'],
    ['J', 'H'],
    ['I', 'H'],
  ],
  directed: false,
} satisfies UndirectedGraph;

const tenNodes = {
  name: 'Ten nodes',
  type: searchGraph,
  initialState: {
    ...tenNodesGraph,
    startId: 'A',
    endId: 'H',
  },
} satisfies SandboxProblem<typeof searchGraph>;

export default tenNodes;
