import { createParameterizedAlgorithm, SandboxParam } from '@algo-sandbox/core';
import {
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
} from '@algo-sandbox/states';

const depthLimitedSearch = createParameterizedAlgorithm({
  name: 'Depth-first search',
  accepts: sandboxEnvironmentState,
  outputs: sandboxEnvironmentSearchState,
  parameters: {
    depthLimit: SandboxParam.integer('Depth limit', 10, (value) => {
      if (value < 0) {
        return 'Depth limit must be greater than or equal 0';
      }
      if (value !== Math.floor(value)) {
        return 'Depth limit must be an integer';
      }

      return true;
    }),
  },
  getPseudocode: ({ depthLimit }) => `create frontier : stack
create visited
insert (initial state, depth = 0) to frontier and visited
while frontier is not empty:
  state, depth = frontier.pop()
  if state is goal: return solution
  if depth >= depthLimit of ${depthLimit}: continue

  for action in actions(state):
    next state = transition(state, action)
    if next state in visited: continue
    if next state is goal: return solution
    frontier.push(next state, depth + 1)
    visited.add(next state)
return failure`,
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
  *runAlgorithm({ line, state, problemState, parameters: { depthLimit } }) {
    // create frontier
    // create visited
    yield line(
      1,
      2,
      'Create a frontier stack to track states to visit, and a visited set.',
    );

    // insert initial state to queue and visited
    state.frontier.push({
      state: state.currentState,
      cost: 0,
      isGoal: false,
      data: { depth: 0 },
    });
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
      const {
        state: visitedState,
        cost,
        isGoal,
        data: { depth: depthRaw },
      } = state.frontier.pop()!;
      const depth = depthRaw as number;
      state.currentState = visitedState;
      const currentKey = problemState.getStateKey(state.currentState);

      yield line(
        5,
        `Pop ${problemState.getStateKey(
          state.currentState,
        )} of depth ${depth} from frontier.`,
      );

      // if state is goal: return solution
      if (isGoal) {
        yield line(
          6,
          `State ${problemState.getStateKey(
            state.currentState,
          )} is the goal. Solution found.`,
        );
        return true;
      } else {
        yield line(
          6,
          `State ${problemState.getStateKey(
            state.currentState,
          )} is not the goal.`,
        );
      }

      // if depth >= depthLimit: continue
      if (depth >= depthLimit) {
        yield line(
          7,
          `State ${problemState.getStateKey(
            state.currentState,
          )} reached depth limit of ${depthLimit}. Skip this node.`,
        );
        continue;
      } else {
        yield line(
          7,
          `State ${problemState.getStateKey(
            state.currentState,
          )} has not reached depth limit of ${depthLimit}.`,
        );
      }

      // for action in actions(state):
      state.actions = problemState.actions(state.currentState);
      yield line(
        9,
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
        yield line(10, `Next state = ${problemState.getStateKey(nextState)}`);

        // if nextState in visited: continue
        if (state.visited.has(nextStateKey)) {
          yield line(11, `Next state ${nextStateKey} is already visited.`);
          continue;
        }
        yield line(11, `Next state ${nextStateKey} is not visited.`);

        // if nextState is goal: return solution
        if (terminated) {
          yield line(
            12,
            `Next state ${nextStateKey} is the goal. Solution found.`,
          );
          return true;
        }
        yield line(12, `Next state ${nextStateKey} is not the goal.`);

        // frontier.push(next state)
        // visited.add(next state)
        state.frontier.push({
          state: nextState,
          cost: cost + 1,
          isGoal: false,
          data: {
            depth: depth + 1,
          },
        });
        state.visited.add(nextStateKey);
        yield line(
          13,
          14,
          `Add next state ${nextStateKey}, depth = ${
            depth + 1
          } to frontier and visited set.`,
        );
      }
    }

    yield line(15, 'Frontier is empty. No solution found.');

    return true;
  },
});

export default depthLimitedSearch;
