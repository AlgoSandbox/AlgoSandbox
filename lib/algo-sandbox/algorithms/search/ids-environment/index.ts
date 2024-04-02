import { createParameterizedAlgorithm, SandboxParam } from '@algo-sandbox/core';
import {
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
  SearchTreeNode,
} from '@algo-sandbox/states';
import { Draft, produce } from 'immer';

function addNodeToSearchTree(
  tree: SearchTreeNode,
  options: {
    fromId: string;
    toId: string;
    toStateKey: string;
    action: string;
  },
) {
  const { fromId, toId, toStateKey, action } = options;
  const newNode: SearchTreeNode = {
    id: toId,
    stateKey: toStateKey,
    action,
    children: [],
  };

  const newTree = produce(tree, (draft) => {
    const findAndPush = (node: Draft<SearchTreeNode>) => {
      if (node.id === fromId) {
        node.children.push(newNode);
        return true;
      }
      for (const child of node.children) {
        if (findAndPush(child)) {
          return true;
        }
      }
      return false;
    };

    findAndPush(draft);
  });

  return newTree;
}

const iterativeDeepeningSearch = createParameterizedAlgorithm({
  name: 'Iterative deepening search',
  accepts: sandboxEnvironmentState,
  outputs: sandboxEnvironmentSearchState,
  parameters: {
    maxDepth: SandboxParam.integer('Max depth', 10, (value) => {
      if (value < 0) {
        return 'Max depth must be greater than or equal 0';
      }
      if (value !== Math.floor(value)) {
        return 'Max depth must be an integer';
      }

      return true;
    }),
  },
  getPseudocode: ({ maxDepth }) => `depthLimitedSearch(depthLimit):
  create frontier
  create visited
  insert (initial state, depth = 0) to frontier and visited
  while frontier is not empty:
    state, depth = frontier.pop()
    if state is goal: return solution
    if depth >= depthLimit: continue

    for action in actions(state):
      next state = transition(state, action)
      if next state in visited: continue
      if next state is goal: return solution
      frontier.push(next state, depth + 1)
      visited.add(next state)
  return failure

iterativeDeepeningSearch(maxDepth):
  for depthLimit = 0 to maxDepth of ${maxDepth}:
    result = depthLimitedSearch(depthLimit)
    if result is solution: return solution
  return failure
`,
  createInitialState: (problem) => {
    const initialState = problem.getInitialState();
    return {
      currentState: initialState,
      initialState,
      visited: new Set<string>(),
      frontier: [], // Using an array as a stack
      actions: problem.actions(initialState),
      searchTree: null,
    };
  },
  *runAlgorithm({ line, state, problemState, parameters: { maxDepth } }) {
    for (let depthLimit = 0; depthLimit <= maxDepth; depthLimit++) {
      let nextAvailableId = 0;

      const getNextId = () => {
        return (nextAvailableId++).toString();
      };

      yield line(20, `Run DFS with depth limit = ${depthLimit}`);

      // Reset
      state.frontier = [];
      state.visited = new Set<string>();
      state.searchTree = null;

      // create frontier
      // create visited
      yield line(
        2,
        3,
        'Create a frontier stack to track states to visit, and a visited set.',
      );

      // insert initial state to queue and visited
      const initialNodeId = getNextId();
      const initialStateKey = problemState.getStateKey(state.currentState);
      state.frontier.push({
        id: initialNodeId,
        state: state.currentState,
        cost: 0,
        isGoal: false,
        data: { depth: 0 },
      });
      state.visited.add(initialStateKey);
      state.searchTree = {
        id: initialNodeId,
        stateKey: initialStateKey,
        action: null,
        children: [],
      };
      yield line(4, 'Insert the initial state to frontier and visited set.');

      // while frontier is not empty
      while (true) {
        // check if frontier is empty
        if (state.frontier.length === 0) {
          yield line(5, 'Frontier is empty.');
          break;
        }
        yield line(5, 'Frontier is not empty.');

        // state = frontier.pop()
        const {
          id: currentId,
          state: visitedState,
          cost,
          isGoal,
          data: { depth: depthRaw },
        } = state.frontier.pop()!;
        const depth = depthRaw as number;
        state.currentState = visitedState;
        const currentKey = problemState.getStateKey(state.currentState);

        yield line(
          6,
          `Pop ${problemState.getStateKey(
            state.currentState,
          )} of depth ${depth} from frontier.`,
        );

        // if state is goal: return solution
        if (isGoal) {
          yield line(
            7,
            `State ${problemState.getStateKey(
              state.currentState,
            )} is the goal. Solution found.`,
          );
          return true;
        } else {
          yield line(
            7,
            `State ${problemState.getStateKey(
              state.currentState,
            )} is not the goal.`,
          );
        }

        // if depth >= depthLimit: continue
        if (depth >= depthLimit) {
          yield line(
            8,
            `State ${problemState.getStateKey(
              state.currentState,
            )} reached depth limit of ${depthLimit}. Skip this node.`,
          );
          continue;
        } else {
          yield line(
            8,
            `State ${problemState.getStateKey(
              state.currentState,
            )} has not reached depth limit of ${depthLimit}.`,
          );
        }

        // for action in actions(state):
        state.actions = problemState.actions(state.currentState);
        yield line(
          10,
          `Actions(${currentKey}) = ${state.actions.map(String).join(', ')}`,
        );

        for (const action of state.actions) {
          const { nextState, terminated } = problemState.step(
            state.currentState,
            action,
          );
          const nextStateId = getNextId();
          const nextStateKey = problemState.getStateKey(nextState);
          state.searchTree = addNodeToSearchTree(state.searchTree, {
            fromId: currentId,
            toId: nextStateId,
            toStateKey: nextStateKey,
            action,
          });
          yield line(11, `Next state = ${problemState.getStateKey(nextState)}`);

          // if nextState in visited: continue
          if (state.visited.has(nextStateKey)) {
            yield line(12, `Next state ${nextStateKey} is already visited.`);
            continue;
          }
          yield line(12, `Next state ${nextStateKey} is not visited.`);

          // if nextState is goal: return solution
          if (terminated) {
            yield line(
              13,
              `Next state ${nextStateKey} is the goal. Solution found.`,
            );
            return true;
          }
          yield line(13, `Next state ${nextStateKey} is not the goal.`);

          // frontier.push(next state)
          // visited.add(next state)
          state.frontier.push({
            id: nextStateId,
            state: nextState,
            cost: cost + 1,
            isGoal: false,
            data: {
              depth: depth + 1,
            },
          });
          state.visited.add(nextStateKey);
          yield line(
            14,
            15,
            `Add next state ${nextStateKey}, depth = ${
              depth + 1
            } to frontier and visited set.`,
          );
        }
      }

      yield line(16, 'Frontier is empty. No solution found.');
    }

    return true;
  },
});

export default iterativeDeepeningSearch;
