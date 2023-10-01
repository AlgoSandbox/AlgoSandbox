import { SandboxProblem } from '../../../core';
import { UndirectedGraph } from '..';
import { SearchGraph } from '@/lib/algo-sandbox/algorithms/search';

export namespace UndirectedGraphs {
  export const fiveNodes = {
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
    edges: [
      ['A', 'B'],
      ['B', 'C'],
      ['B', 'D'],
      ['D', 'E'],
      ['A', 'E'],
    ],
    directed: false,
  } satisfies UndirectedGraph<string>;
}

export namespace UndirectedGraphSearchProblems {
  export const fiveNodes = {
    name: 'Five nodes',
    initialState: {
      ...UndirectedGraphs.fiveNodes,
      startId: 'A',
      endId: 'D',
    },
  } satisfies SandboxProblem<SearchGraph>;
}
