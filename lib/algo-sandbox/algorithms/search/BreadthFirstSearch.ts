import { SearchGraph } from '.';
import { SandboxAlgorithm } from '@/lib/algo-sandbox/core';

type BFSState = {
  graph: SearchGraph;
  q: Array<string>;
  visited: Set<string>;
  currNode: string | null;
};

const pseudocode = `BFS(G, start):
  Create an empty queue Q
  Create a boolean array visited of size |V| (where V is the set of vertices)
  Initialize all elements of visited to false

  Enqueue start into Q
  Set visited[start] to true

  while Q is not empty:
      Dequeue a vertex v from Q
      if v is the end node, terminate

      for each neighbor u of v:
          if u is not visited:
              Enqueue u into Q
              Set visited[u] to true`;

export const breadthFirstSearch: SandboxAlgorithm<SearchGraph, BFSState> = {
  pseudocode,
  getInitialState(problem) {
    return {
      graph: problem,
      q: [],
      visited: new Set(),
      currNode: null,
    };
  },
  *runAlgorithm({ line, state }) {
    yield line(2, 4);
    // Enqueue start into Q
    state.q.push(state.graph.startId);
    yield line(6);

    // Set visited[start] to true
    state.visited.add(state.graph.startId);
    yield line(7);

    while (true) {
      yield line(9);
      if (state.q.length === 0) {
        break;
      }
      state.currNode = state.q.splice(0, 1)[0];
      yield line(10, 11);
      if (state.currNode === state.graph.endId) {
        break;
      }

      // each neighbor of v
      for (const [start, end] of state.graph.edges) {
        if (start !== state.currNode && end !== state.currNode) {
          continue;
        }

        const neighbor = start === state.currNode ? end : start;
        if (!state.visited.has(neighbor)) {
          state.q.push(neighbor);
          state.visited.add(neighbor);
        }
      }

      yield line(13, 16);
    }

    return true;
  },
};
