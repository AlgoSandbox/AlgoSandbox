import { SandboxAlgorithm } from '@algo-sandbox/core';
import { graphSearchAlgorithmState, searchGraph } from '@algo-sandbox/states';

const pseudocode = `DFS(G, v):
  Create a stack toVisit
  Create a boolean array visited of size |V| (where V is the set of vertices)
  Initialize all elements of visited to false

  Push v onto toVisit

  while toVisit is not empty:
    Pop a vertex v from toVisit
    if v is the end node, terminate

    if v is not visited:
      Set visited[v] to true

      for each neighbor u of v:
        Push u onto toVisit`;

const depthFirstSearch: SandboxAlgorithm<
  typeof searchGraph,
  typeof graphSearchAlgorithmState
> = {
  name: 'Depth-first search',
  accepts: searchGraph,
  outputs: graphSearchAlgorithmState,
  pseudocode,
  createInitialState(problem) {
    return {
      graph: problem,
      toVisit: [],
      visited: new Set(),
      currentNodeId: null,
    };
  },
  *runAlgorithm({ line, state }) {
    yield line(2, 4);
    // Push the start node onto the stack
    state.toVisit.push(state.graph.startId);
    yield line(6);

    while (true) {
      yield line(8);
      if (state.toVisit.length === 0) {
        break;
      }
      // Pop a vertex from the stack
      state.currentNodeId = state.toVisit.pop()!;
      yield line(9, 10);
      if (state.currentNodeId === state.graph.endId) {
        break;
      }

      // Check if the vertex has not been visited yet
      if (!state.visited.has(state.currentNodeId)) {
        state.visited.add(state.currentNodeId);
        yield line(12, 13);

        // Iterate through neighbors of the current node
        for (const [start, end] of state.graph.edges) {
          const startNodeId =
            typeof start === 'string' ? start : state.graph.nodes[start].id;
          const endNodeId =
            typeof end === 'string' ? end : state.graph.nodes[end].id;

          if (
            startNodeId === state.currentNodeId &&
            !state.visited.has(endNodeId)
          ) {
            // Push unvisited neighbors onto the stack
            state.toVisit.push(endNodeId);
          } else if (
            endNodeId === state.currentNodeId &&
            !state.visited.has(startNodeId)
          ) {
            // Push unvisited neighbors onto the stack
            state.toVisit.push(startNodeId);
          }
        }
      }

      yield line(15, 16);
    }

    return true;
  },
};

export default depthFirstSearch;
