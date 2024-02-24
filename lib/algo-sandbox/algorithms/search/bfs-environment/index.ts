import { createAlgorithm } from '@algo-sandbox/core';
import {
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
} from '@algo-sandbox/states';

const pseudocode = `BFS(G, start):
  Create an empty queue toVisit
  Create a boolean array visited of size |V| (where V is the set of vertices)
  Initialize all elements of visited to false

  Enqueue start into toVisit
  Set visited[start] to true

  while toVisit is not empty:
      Dequeue a state s from toVisit
      if s is a goal state, terminate

      for each action in actions(s):
          let u be the neighbor of s that is reached by action
          if u is not visited:
              Enqueue u into toVisit
              Set visited[u] to true`;

const breadthFirstSearch = createAlgorithm({
  name: 'Breadth-first search (env)',
  accepts: sandboxEnvironmentState,
  outputs: sandboxEnvironmentSearchState,
  pseudocode,
  createInitialState: (problem) => {
    const initialState = problem.getInitialState();
    return {
      currentState: initialState,
      initialState,
      visited: new Set<string>(),
      toVisit: [],
      actions: problem.actions(initialState),
      getStateKey: problem.getStateKey,
      searchTree: [],
    };
  },
  *runAlgorithm({ line, state, problemState }) {
    yield line(2, 4);
    // Enqueue start into Q
    state.toVisit.push({ state: state.currentState, isGoal: false, cost: 0 });
    yield line(6);

    // Set visited[start] to true
    state.visited.add(problemState.getStateKey(state.currentState));
    yield line(7);

    while (true) {
      yield line(9);
      if (state.toVisit.length === 0) {
        break;
      }
      const {
        state: visitedState,
        isGoal,
        cost,
      } = state.toVisit.splice(0, 1)[0];
      state.currentState = visitedState;
      state.actions = problemState.actions(state.currentState);
      yield line(10, 11);

      if (isGoal) {
        return true;
      }

      // each neighbor of v
      for (const action of state.actions) {
        const { nextState, terminated } = problemState.step(
          state.currentState,
          action,
        );

        const neighborKey = problemState.getStateKey(nextState);
        const currentKey = problemState.getStateKey(state.currentState);

        if (!state.visited.has(neighborKey)) {
          state.toVisit.push({
            state: nextState,
            isGoal: terminated,
            cost: cost + 1,
          });
          state.visited.add(neighborKey);
          state.searchTree = [
            ...state.searchTree,
            {
              source: currentKey,
              action,
              result: neighborKey,
            },
          ];
        }
      }

      yield line(13, 17);
    }

    return true;
  },
});

export default breadthFirstSearch;
