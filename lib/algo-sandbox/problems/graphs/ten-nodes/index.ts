import { SandboxProblem } from '@algo-sandbox/core';
import { UndirectedGraph } from '@algo-sandbox/problems';

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
  shape: 'searchGraph',
  initialState: {
    ...tenNodesGraph,
    _stateName: 'searchGraph',
    startId: 'A',
    endId: 'H',
  },
} satisfies SandboxProblem<'searchGraph'>;

export default tenNodes;
