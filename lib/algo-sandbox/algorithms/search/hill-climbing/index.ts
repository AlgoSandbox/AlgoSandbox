import { createAlgorithm } from '@algo-sandbox/core';
import {
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
} from '@algo-sandbox/states';

const pseudocode = `add initial state to frontier
loop:
  current = frontier.pop()
  neighbor = a highest value successor of current
  if value(neighbor) <= value(current):
    return current
  push neighbor to frontier
`;

const hillClimbing = createAlgorithm({
  name: 'Hill climbing',
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
    // insert initial state to queue and visited
    state.frontier.push({ state: state.currentState, cost: 0, isGoal: false });
    state.visited.add(problemState.getStateKey(state.currentState));

    yield line(1, 'Add initial state to frontier.');

    // while frontier is not empty
    while (state.frontier.length > 0) {
      const { state: newState, cost } = state.frontier.shift()!;
      state.currentState = newState;

      const currentKey = problemState.getStateKey(state.currentState);

      state.actions = problemState.actions(state.currentState);

      const stepResults = state.actions.map((action) => {
        return {
          action,
          result: problemState.step(state.currentState, action),
        };
      });

      stepResults.forEach(({ action, result: { nextState } }) => {
        const nextStateKey = problemState.getStateKey(nextState);
        state.visited.add(nextStateKey);
        state.searchTree = [
          ...state.searchTree,
          {
            source: currentKey,
            action,
            result: nextStateKey,
          },
        ];
      });

      stepResults.sort((a, b) => b.result.reward - a.result.reward);

      const neighbor = stepResults.at(0)?.result;

      if (neighbor === undefined) {
        return true;
      }

      yield line(4, `Neighbor has a value of ${-cost + neighbor.reward}`);

      if (neighbor.reward < 0) {
        yield line(
          5,
          'Neighbor has a lower value than current state. Return current state.',
        );
        return true;
      }

      state.frontier.push({
        state: neighbor.nextState,
        cost: cost - neighbor.reward,
        isGoal: neighbor.terminated,
      });

      yield line(7, 'Push neighbor to frontier.');
    }

    throw new Error('Error occurred while running hill climbing algorithm.');
  },
});

export default hillClimbing;
