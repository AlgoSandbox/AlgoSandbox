import { createAlgorithm } from '@algo-sandbox/core';
import {
  sandboxEnvironmentSearchState,
  sandboxEnvironmentState,
} from '@algo-sandbox/states';
import { sortedIndexBy } from 'lodash';

const pseudocode = `UCS(G, start):
  Create a priority queue Q
  Create a map cost of size |V| (where V is the set of vertices)
  Initialize all elements of cost to positive infinity

  cost[start] = 0
  Q.enqueue(start, 0)

  while Q is not empty:
    Remove (u, c(u)) from Q with the lowest cost c(u)
    if u is a goal state, terminate

    for each action in actions(u):
      let v be the neighbor of u that is reached by action
      let new_cost = c(u) + cost(action, u, v)
      if new_cost < cost[v]:
        cost[v] = new_cost
        Q.enqueue(v, new_cost)`;

const uniformCostSearch = createAlgorithm({
  name: 'Uniform-cost search (env)',
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

    // Add start to frontier with cost 0
    state.frontier.push({ state: state.currentState, cost: 0, isGoal: false });

    yield line(6);

    while (state.frontier.length > 0) {
      yield line(9);

      const { state: visitedState, cost, isGoal } = state.frontier.shift()!;
      state.currentState = visitedState;
      state.actions = problemState.actions(state.currentState);

      yield line(10, 11);

      if (isGoal) {
        return true;
      }

      // Mark visited
      state.visited.add(problemState.getStateKey(state.currentState));

      // each neighbor of v
      for (const action of state.actions) {
        const { nextState, terminated, reward } = problemState.step(
          state.currentState,
          action,
        );

        const neighborKey = problemState.getStateKey(nextState);
        const currentKey = problemState.getStateKey(state.currentState);

        const newCost = cost - reward; // Use reward as negative cost

        if (
          !state.visited.has(neighborKey) ||
          newCost <
            state.frontier.find((item) => problemState.getStateKey(item.state))!
              .cost
        ) {
          // Insert into priority queue, where 0 is the highest priority
          const valueToInsert = {
            state: nextState,
            cost: newCost,
            isGoal: terminated,
          };
          state.frontier.splice(
            sortedIndexBy(state.frontier, valueToInsert, 'cost'),
            0,
            valueToInsert,
          );

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

export default uniformCostSearch;
