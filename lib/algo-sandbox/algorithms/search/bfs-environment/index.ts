import { createAlgorithm } from '@algo-sandbox/core';
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

const pseudocode = `create frontier
create visited
insert initial state to frontier and visited
while frontier is not empty:
  state = frontier.pop()
  for action in actions(state):
    next state = transition(state, action)
    if next state in visited: continue
    if next state is goal: return solution
    frontier.add(next state)
    visited.add(next state)
return failure`;

const breadthFirstSearch = createAlgorithm({
  name: 'Breadth-first search',
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
      searchTree: null,
    };
  },
  *runAlgorithm({ line, state, problemState }) {
    let nextAvailableId = 0;

    const getNextId = () => {
      return (nextAvailableId++).toString();
    };

    // create frontier
    // create visited
    yield line(
      1,
      2,
      'Create a frontier to keep track of the states to visit, and a visited set to keep track of visited states.',
    );

    // insert initial state to frontier and visited
    const initialNodeId = getNextId();
    const initialStateKey = problemState.getStateKey(state.currentState);
    state.frontier.push({
      id: initialNodeId,
      state: state.currentState,
      cost: 0,
      isGoal: false,
    });
    state.visited.add(initialStateKey);
    state.searchTree = {
      id: initialNodeId,
      stateKey: initialStateKey,
      action: null,
      children: [],
    };
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
        id: currentId,
        state: visitedState,
        cost,
      } = state.frontier.shift()!;
      state.currentState = visitedState;
      const currentKey = problemState.getStateKey(state.currentState);

      yield line(
        5,
        `Pop ${problemState.getStateKey(state.currentState)} from frontier.`,
      );

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
        const nextStateId = getNextId();
        const nextStateKey = problemState.getStateKey(nextState);
        state.searchTree = addNodeToSearchTree(state.searchTree, {
          fromId: currentId,
          toId: nextStateId,
          toStateKey: nextStateKey,
          action,
        });
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

        // frontier.add(nextState)
        // visited.add(nextState)
        state.frontier.push({
          state: nextState,
          cost: cost + 1,
          isGoal: false,
          id: nextStateId,
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

export default breadthFirstSearch;
