import { SandboxProblem } from '../../core';
import { UndirectedGraph } from '.';

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

namespace Undirected {
  export const fiveNodes = {
    name: 'Five nodes',
    shape: 'searchGraph',
    initialState: {
      ...fiveNodesGraph,
      _stateName: 'searchGraph',
      startId: 'A',
      endId: 'D',
    },
  } satisfies SandboxProblem<'searchGraph'>;

  export const tenNodes = {
    name: 'Ten nodes',
    shape: 'searchGraph',
    initialState: {
      ...tenNodesGraph,
      _stateName: 'searchGraph',
      startId: 'A',
      endId: 'H',
    },
  } satisfies SandboxProblem<'searchGraph'>;
}

export default Undirected;
