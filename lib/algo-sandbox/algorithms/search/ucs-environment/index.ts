import { createAlgorithm } from '@algo-sandbox/core';
import {
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
  SearchTreeNode,
} from '@algo-sandbox/states';
import { Draft, produce } from 'immer';
import { sortedIndexBy } from 'lodash';

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

const pseudocode = `create frontier (priority queue based on cost)
create visited
insert (initial state, cost = 0) to frontier and visited
while frontier is not empty:
  state, state cost = frontier.pop() with lowest cost
  if state is goal: return solution

  for action in actions(state):
    next state = transition(state, action)
    new cost = state cost + cost(action)
    if next state in visited:
      frontier cost = frontier.getCost(next state)
      if frontier cost is null: continue
      if frontier cost > new cost: continue
    else:
      visited.add(next state)
    frontier.add(next state, new cost)
return failure`;

const uniformCostSearch = createAlgorithm({
  name: 'Uniform-cost search',
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

    // create frontier (priority queue based on cost)
    // create visited
    yield line(
      1,
      2,
      'Create a frontier (priority queue) to keep track of states and their costs, and a visited set to keep track of visited states.',
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
        break;
      }
      yield line(4, 'Check if frontier is empty.');

      // state = frontier.pop() with lowest cost
      const {
        id: currentId,
        state: visitedState,
        cost,
        isGoal,
      } = state.frontier.shift()!;
      state.currentState = visitedState;
      const currentKey = problemState.getStateKey(state.currentState);
      yield line(5, `Pop ${currentKey} with cost ${cost} from frontier.`);

      // if state is goal: return solution
      if (isGoal) {
        yield line(6, `${currentKey} is the goal. Solution found.`);
        return true;
      } else {
        yield line(6, `${currentKey} is not the goal.`);
      }

      // for action in actions(state):
      state.actions = problemState.actions(state.currentState);
      yield line(6, `Get actions for current state ${currentKey}.`);

      for (const action of state.actions) {
        const { nextState, terminated, reward } = problemState.step(
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
        yield line(9, `Next state: ${nextStateKey}`);

        const newCost = cost - reward;
        const currentCost =
          state.frontier.find(
            (f) => problemState.getStateKey(f.state) === nextStateKey,
          )?.cost ?? null;
        yield line(
          10,
          `New cost: ${newCost}, Current cost: ${currentCost ?? 'Infinity'}`,
        );

        // if next state in visited:
        //   if frontier.getCost(next state) > new cost: continue
        // else:
        //   visited.add(next state)
        // frontier.add(next state, new cost)

        // if nextState in visited: continue
        if (state.visited.has(nextStateKey)) {
          yield line(11, `Next state ${nextStateKey} is already visited.`);

          if (currentCost === null) {
            yield line(
              13,
              `${nextStateKey} has already been visited. Continue`,
            );
            continue;
          } else if (currentCost > newCost) {
            yield line(
              14,
              `Current cost ${currentCost} is greater than new cost ${newCost}.`,
            );
          } else {
            yield line(
              14,
              `Current cost ${currentCost} is less than new cost ${newCost}. Continue.`,
            );
            continue;
          }
        } else {
          yield line(15, `Next state ${nextStateKey} is not visited.`);

          state.visited.add(nextStateKey);
          yield line(16, `Add next state ${nextStateKey} to visited set.`);
        }

        // Insert into priority queue, where 0 is the highest priority
        const valueToInsert = {
          id: nextStateId,
          state: nextState,
          cost: newCost,
          isGoal: terminated,
        };
        /// Insert to the correct position in the frontier
        state.frontier.splice(
          sortedIndexBy(state.frontier, valueToInsert, 'cost'),
          0,
          valueToInsert,
        );

        yield line(
          17,
          `Add next state ${nextStateKey} to frontier with cost ${newCost}.`,
        );
      }
    }

    yield line(12, 'Frontier is empty. No solution found.');

    return true;
  },
});

export default uniformCostSearch;
