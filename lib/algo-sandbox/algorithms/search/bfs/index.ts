import { createAlgorithm } from '@algo-sandbox/core';
import { graphSearchAlgorithmState, searchGraph } from '@algo-sandbox/states';

const pseudocode = `BFS(G, start):
  Create an empty queue toVisit
  Create a boolean array visited of size |V| (where V is the set of vertices)
  Initialize all elements of visited to false

  Enqueue start into toVisit
  Set visited[start] to true

  while toVisit is not empty:
      Dequeue a vertex v from toVisit
      if v is the end node, terminate

      for each neighbor u of v:
          if u is not visited:
              Enqueue u into toVisit
              Set visited[u] to true`;

const breadthFirstSearch = createAlgorithm({
  name: 'Breadth-first search (graph)',
  accepts: searchGraph,
  outputs: graphSearchAlgorithmState,
  pseudocode,
  createInitialState: (problem) => {
    return {
      graph: problem,
      toVisit: [],
      visited: new Set<string>(),
      currentNodeId: null,
    };
  },
  *runAlgorithm({ line, state }) {
    yield line(2, 4);
    // Enqueue start into Q
    state.toVisit.push(state.graph.startId);
    yield line(6);

    // Set visited[start] to true
    state.visited.add(state.graph.startId);
    yield line(7);

    while (true) {
      yield line(9);
      if (state.toVisit.length === 0) {
        break;
      }
      state.currentNodeId = state.toVisit.splice(0, 1)[0];
      yield line(10, 11);
      if (state.currentNodeId === state.graph.endId) {
        break;
      }

      // each neighbor of v
      for (const [start, end] of state.graph.edges) {
        const startNodeId =
          typeof start === 'string' ? start : state.graph.nodes[start].id;
        const endNodeId =
          typeof end === 'string' ? end : state.graph.nodes[end].id;
        if (
          startNodeId !== state.currentNodeId &&
          endNodeId !== state.currentNodeId
        ) {
          continue;
        }

        const neighbor =
          start === state.currentNodeId ? endNodeId : startNodeId;
        if (!state.visited.has(neighbor)) {
          state.toVisit.push(neighbor);
          state.visited.add(neighbor);
        }
      }

      yield line(13, 16);
    }

    return true;
  },
});

export default breadthFirstSearch;
