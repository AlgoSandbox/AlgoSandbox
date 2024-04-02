import { createAlgorithm, createState } from '@algo-sandbox/core';
import {
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
} from '@algo-sandbox/states';
import { z } from 'zod';

const pseudocode = `
def minimax(state):
  v = max_value(state)
  return action in successors(state) with value v

def max_value(state):
  if is_terminal(state):
    return utility(state)
  v = -∞
  for action, next_state in successors(state):
    v = max(v, min_value(next_state))
  return v

def min_value(state):
  if is_terminal(state):
    return utility(state)
  v = ∞
  for action, next_state in successors(state):
    v = min(v, max_value(next_state))
  return v`;

const minimaxInputState = createState(
  'Minimax input',
  z.object({
    environment: sandboxEnvironmentState.shape,
    isMaximizingPlayer: z.function().returns(z.boolean()),
  }),
);

const minimaxAlgorithm = createAlgorithm({
  name: 'Minimax',
  accepts: minimaxInputState,
  outputs: sandboxEnvironmentSearchState,
  pseudocode,
  createInitialState: ({ environment }) => {
    const initialState = environment.getInitialState();
    return {
      currentState: initialState,
      initialState,
      visited: new Set<string>(),
      frontier: [],
      actions: environment.actions(initialState),
      searchTree: [],
    };
  },
  *runAlgorithm({
    line,
    state,
    problemState: { environment, isMaximizingPlayer },
  }) {
    // pretraverse the entire state
    const currentState = state.currentState;

    // states[stateKey] = state
    const states: Record<string, Record<string, any>> = {};
    // graph[stateKey][action] = nextStateKey
    const graph: Record<string, Record<string, string>> = {};

    const toVisit = [currentState];

    while (toVisit.length > 0) {
      const state = toVisit.pop()!;
      const stateKey = environment.getStateKey(state);
      states[stateKey] = state;
      graph[stateKey] = {};

      for (const action of environment.actions(state)) {
        const nextState = environment.step(state, action);
        const nextStateKey = environment.getStateKey(nextState);

        if (!states[nextStateKey]) {
          toVisit.push(nextState);
        }

        graph[stateKey][action] = nextStateKey;
      }
    }
    console.log(states);
    console.log(graph);

    yield line(1, 'hi.');

    return true;
  },
});

export default minimaxAlgorithm;
