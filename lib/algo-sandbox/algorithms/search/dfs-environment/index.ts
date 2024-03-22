import { createAlgorithm } from '@algo-sandbox/core';
import {
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
} from '@algo-sandbox/states';

const pseudocode = `create frontier
create visited
insert initial state to frontier and visited
while frontier is not empty:
  state = frontier.pop()
  for action in actions(state):
    next state = transition(state, action)
    if next state in visited: continue
    if next state is goal: return solution
    frontier.push(next state)
    visited.add(next state)
return failure`;

const depthFirstSearch = createAlgorithm({
  name: 'Depth-first search',
  accepts: sandboxEnvironmentState,
  outputs: sandboxEnvironmentSearchState,
  pseudocode,
  createInitialState: (problem) => {
    const initialState = problem.getInitialState();
    return {
      currentState: initialState,
      initialState,
      visited: new Set<string>(),
      frontier: [], // Using an array as a stack
      actions: problem.actions(initialState),
      searchTree: [],
    };
  },
  *runAlgorithm({ line, state, problemState }) {
    // create frontier
    // create visited
    yield line(
      1,
      2,
      'Create a frontier stack to track states to visit, and a visited set.',
    );

    // insert initial state to queue and visited
    state.frontier.push({ state: state.currentState, cost: 0, isGoal: false });
    state.visited.add(problemState.getStateKey(state.currentState));
    yield line(3, 'Insert the initial state to frontier and visited set.');

    // while frontier is not empty
    while (true) {
      // check if frontier is empty
      if (state.frontier.length === 0) {
        yield line(4, 'Frontier is empty.');
        break;
      }
      yield line(4, 'Frontier is not empty.');

      // state = frontier.pop()
      const { state: visitedState, cost } = state.frontier.pop()!;
      state.currentState = visitedState;
      const currentKey = problemState.getStateKey(state.currentState);
      yield line(5, `Pop ${currentKey} from frontier.`);

      // for action in actions(state):
      state.actions = problemState.actions(state.currentState);
      yield line(
        6,
        `Actions(${currentKey}) = ${state.actions.map(String).join(', ')}`,
      );

      for (const action of state.actions) {
        const { nextState, terminated } = problemState.step(
          state.currentState,
          action,
        );
        const nextStateKey = problemState.getStateKey(nextState);
        state.searchTree = [
          ...state.searchTree,
          {
            source: currentKey,
            action,
            result: nextStateKey,
          },
        ];
        yield line(7, `Next state = ${problemState.getStateKey(nextState)}`);

        // if nextState in visited: continue
        if (state.visited.has(nextStateKey)) {
          yield line(8, `Next state ${nextStateKey} is already visited.`);
          continue;
        }
        yield line(8, `Next state ${nextStateKey} is not visited.`);

        // if nextState is goal: return solution
        if (terminated) {
          yield line(
            9,
            `Next state ${nextStateKey} is the goal. Solution found.`,
          );
          return true;
        }
        yield line(9, `Next state ${nextStateKey} is not the goal.`);

        // frontier.push(next state)
        // visited.add(next state)
        state.frontier.push({
          state: nextState,
          cost: cost + 1,
          isGoal: false,
        });
        state.visited.add(nextStateKey);
        yield line(
          10,
          11,
          `Add next state ${nextStateKey} to frontier and visited set.`,
        );
      }
    }

    yield line(12, 'Frontier is empty. No solution found.');

    return true;
  },
});

export default depthFirstSearch;
