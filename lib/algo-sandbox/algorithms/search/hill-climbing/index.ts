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
      searchTree: null,
    };
  },
  *runAlgorithm({ line, state, problemState }) {
    let nextAvailableId = 0;

    const getNextId = () => {
      return (nextAvailableId++).toString();
    };

    // insert initial state to queue and visited
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

    yield line(1, 'Add initial state to frontier.');

    // while frontier is not empty
    while (state.frontier.length > 0) {
      const { id: currentId, state: newState, cost } = state.frontier.shift()!;
      state.currentState = newState;
      state.actions = problemState.actions(state.currentState);

      const stepResults = state.actions.map((action) => {
        return {
          id: getNextId(),
          action,
          result: problemState.step(state.currentState, action),
        };
      });

      for (const {
        id: nextStateId,
        action,
        result: { nextState },
      } of stepResults) {
        const nextStateKey = problemState.getStateKey(nextState);
        state.visited.add(nextStateKey);
        state.searchTree = addNodeToSearchTree(state.searchTree, {
          fromId: currentId,
          toId: nextStateId,
          toStateKey: nextStateKey,
          action,
        });
      }

      stepResults.sort((a, b) => b.result.reward - a.result.reward);

      const bestResult = stepResults.at(0);

      if (bestResult === undefined) {
        return true;
      }

      const { id: nextStateId, result: neighbor } = bestResult;

      yield line(4, `Neighbor has a value of ${-cost + neighbor.reward}`);

      if (neighbor.reward < 0) {
        yield line(
          5,
          'Neighbor has a lower value than current state. Return current state.',
        );
        return true;
      }

      state.frontier.push({
        id: nextStateId,
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
