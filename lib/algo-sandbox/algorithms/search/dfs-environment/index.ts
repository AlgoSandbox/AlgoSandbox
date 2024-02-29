import { createAlgorithm } from '@algo-sandbox/core';
import {
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
} from '@algo-sandbox/states';

const pseudocode = `DFS(G, start):
  Create an empty stack frontier
  Create a boolean array visited of size |V| (where V is the set of vertices)
  Initialize all elements of visited to false

  Push start into frontier
  Set visited[start] to true

  while frontier is not empty:
    Pop a state s from frontier
    if s is a goal state, terminate

    for each action in actions(s):
      let u be the neighbor of s that is reached by action
      if u is not visited:
        Push u onto frontier
        Set visited[u] to true`;

const depthFirstSearch = createAlgorithm({
  name: 'Depth-first search (env)',
  accepts: sandboxEnvironmentState,
  outputs: sandboxEnvironmentSearchState,
  pseudocode,
  createInitialState: (problem) => {
    const initialState = problem.getInitialState();
    return {
      currentState: initialState,
      initialState,
      visited: new Set<string>(),
      frontier: [],
      actions: problem.actions(initialState),
      getStateKey: problem.getStateKey,
      searchTree: [],
    };
  },
  *runAlgorithm({ line, state, problemState }) {
    yield line(2, 4);
    // Push start onto S
    state.frontier.push({ state: state.currentState, isGoal: false, cost: 0 });
    yield line(6);

    // Set visited[start] to true
    state.visited.add(problemState.getStateKey(state.currentState));
    yield line(7);

    while (state.frontier.length > 0) {
      yield line(9);
      const { state: visitedState, isGoal, cost } = state.frontier.pop()!;
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
          state.frontier.push({
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

export default depthFirstSearch;
