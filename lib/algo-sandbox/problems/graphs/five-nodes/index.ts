import { SandboxProblem } from '@algo-sandbox/core';
import { UndirectedGraph } from '@algo-sandbox/problems';

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
  shape: 'searchGraph',
  initialState: {
    ...fiveNodesGraph,
    _stateName: 'searchGraph',
    startId: 'A',
    endId: 'D',
  },
} satisfies SandboxProblem<'searchGraph'>;

export default fiveNodes;
